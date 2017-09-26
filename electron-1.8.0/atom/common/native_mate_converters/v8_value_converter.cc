// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/native_mate_converters/v8_value_converter.h"

#include <map>
#include <memory>
#include <string>
#include <utility>

#include "base/logging.h"
#include "base/memory/ptr_util.h"
#include "base/values.h"
#include "native_mate/dictionary.h"

#include "atom/common/node_includes.h"

namespace atom {

namespace {

const int kMaxRecursionDepth = 100;

}  // namespace

// The state of a call to FromV8Value.
class V8ValueConverter::FromV8ValueState {
 public:
  // Level scope which updates the current depth of some FromV8ValueState.
  class Level {
   public:
    explicit Level(FromV8ValueState* state) : state_(state) {
      state_->max_recursion_depth_--;
    }
    ~Level() {
      state_->max_recursion_depth_++;
    }

   private:
    FromV8ValueState* state_;
  };

  FromV8ValueState() : max_recursion_depth_(kMaxRecursionDepth) {}

  // If |handle| is not in |unique_map_|, then add it to |unique_map_| and
  // return true.
  //
  // Otherwise do nothing and return false. Here "A is unique" means that no
  // other handle B in the map points to the same object as A. Note that A can
  // be unique even if there already is another handle with the same identity
  // hash (key) in the map, because two objects can have the same hash.
  bool AddToUniquenessCheck(v8::Local<v8::Object> handle) {
    int hash;
    auto iter = GetIteratorInMap(handle, &hash);
    if (iter != unique_map_.end())
      return false;

    unique_map_.insert(std::make_pair(hash, handle));
    return true;
  }

  bool RemoveFromUniquenessCheck(v8::Local<v8::Object> handle) {
    int unused_hash;
    auto iter = GetIteratorInMap(handle, &unused_hash);
    if (iter == unique_map_.end())
      return false;
    unique_map_.erase(iter);
    return true;
  }

  bool HasReachedMaxRecursionDepth() {
    return max_recursion_depth_ < 0;
  }

 private:
  using HashToHandleMap = std::multimap<int, v8::Local<v8::Object>>;
  using Iterator = HashToHandleMap::const_iterator;

  Iterator GetIteratorInMap(v8::Local<v8::Object> handle, int* hash) {
    *hash = handle->GetIdentityHash();
    // We only compare using == with handles to objects with the same identity
    // hash. Different hash obviously means different objects, but two objects
    // in a couple of thousands could have the same identity hash.
    std::pair<Iterator, Iterator> range = unique_map_.equal_range(*hash);
    for (auto it = range.first; it != range.second; ++it) {
      // Operator == for handles actually compares the underlying objects.
      if (it->second == handle)
        return it;
    }
    // Not found.
    return unique_map_.end();
  }

  HashToHandleMap unique_map_;

  int max_recursion_depth_;
};

// A class to ensure that objects/arrays that are being converted by
// this V8ValueConverterImpl do not have cycles.
//
// An example of cycle: var v = {}; v = {key: v};
// Not an example of cycle: var v = {}; a = [v, v]; or w = {a: v, b: v};
class V8ValueConverter::ScopedUniquenessGuard {
 public:
  ScopedUniquenessGuard(V8ValueConverter::FromV8ValueState* state,
                        v8::Local<v8::Object> value)
      : state_(state),
        value_(value),
        is_valid_(state_->AddToUniquenessCheck(value_)) {}
  ~ScopedUniquenessGuard() {
    if (is_valid_) {
      bool removed = state_->RemoveFromUniquenessCheck(value_);
      DCHECK(removed);
    }
  }

  bool is_valid() const { return is_valid_; }

 private:
  typedef std::multimap<int, v8::Local<v8::Object> > HashToHandleMap;
  V8ValueConverter::FromV8ValueState* state_;
  v8::Local<v8::Object> value_;
  bool is_valid_;

  DISALLOW_COPY_AND_ASSIGN(ScopedUniquenessGuard);
};

V8ValueConverter::V8ValueConverter()
    : reg_exp_allowed_(false),
      function_allowed_(false),
      disable_node_(false),
      strip_null_from_objects_(false) {}

void V8ValueConverter::SetRegExpAllowed(bool val) {
  reg_exp_allowed_ = val;
}

void V8ValueConverter::SetFunctionAllowed(bool val) {
  function_allowed_ = val;
}

void V8ValueConverter::SetStripNullFromObjects(bool val) {
  strip_null_from_objects_ = val;
}

void V8ValueConverter::SetDisableNode(bool val) {
  disable_node_ = val;
}

v8::Local<v8::Value> V8ValueConverter::ToV8Value(
    const base::Value* value, v8::Local<v8::Context> context) const {
  v8::Context::Scope context_scope(context);
  v8::EscapableHandleScope handle_scope(context->GetIsolate());
  return handle_scope.Escape(ToV8ValueImpl(context->GetIsolate(), value));
}

base::Value* V8ValueConverter::FromV8Value(
    v8::Local<v8::Value> val,
    v8::Local<v8::Context> context) const {
  v8::Context::Scope context_scope(context);
  v8::HandleScope handle_scope(context->GetIsolate());
  FromV8ValueState state;
  return FromV8ValueImpl(&state, val, context->GetIsolate());
}

v8::Local<v8::Value> V8ValueConverter::ToV8ValueImpl(
     v8::Isolate* isolate, const base::Value* value) const {
  switch (value->GetType()) {
    case base::Value::Type::NONE:
      return v8::Null(isolate);

    case base::Value::Type::BOOLEAN: {
      bool val = false;
      value->GetAsBoolean(&val);
      return v8::Boolean::New(isolate, val);
    }

    case base::Value::Type::INTEGER: {
      int val = 0;
      value->GetAsInteger(&val);
      return v8::Integer::New(isolate, val);
    }

    case base::Value::Type::DOUBLE: {
      double val = 0.0;
      value->GetAsDouble(&val);
      return v8::Number::New(isolate, val);
    }

    case base::Value::Type::STRING: {
      std::string val;
      value->GetAsString(&val);
      return v8::String::NewFromUtf8(
          isolate, val.c_str(), v8::String::kNormalString, val.length());
    }

    case base::Value::Type::LIST:
      return ToV8Array(isolate, static_cast<const base::ListValue*>(value));

    case base::Value::Type::DICTIONARY:
      return ToV8Object(isolate,
                        static_cast<const base::DictionaryValue*>(value));

    case base::Value::Type::BINARY:
      return ToArrayBuffer(isolate,
                           static_cast<const base::Value*>(value));

    default:
      LOG(ERROR) << "Unexpected value type: " << value->GetType();
      return v8::Null(isolate);
  }
}

v8::Local<v8::Value> V8ValueConverter::ToV8Array(
    v8::Isolate* isolate, const base::ListValue* val) const {
  v8::Local<v8::Array> result(v8::Array::New(isolate, val->GetSize()));

  for (size_t i = 0; i < val->GetSize(); ++i) {
    const base::Value* child = nullptr;
    val->Get(i, &child);

    v8::Local<v8::Value> child_v8 = ToV8ValueImpl(isolate, child);

    v8::TryCatch try_catch;
    result->Set(static_cast<uint32_t>(i), child_v8);
    if (try_catch.HasCaught())
      LOG(ERROR) << "Setter for index " << i << " threw an exception.";
  }

  return result;
}

v8::Local<v8::Value> V8ValueConverter::ToV8Object(
    v8::Isolate* isolate, const base::DictionaryValue* val) const {
  mate::Dictionary result = mate::Dictionary::CreateEmpty(isolate);
  result.SetHidden("simple", true);

  for (base::DictionaryValue::Iterator iter(*val);
       !iter.IsAtEnd(); iter.Advance()) {
    const std::string& key = iter.key();
    v8::Local<v8::Value> child_v8 = ToV8ValueImpl(isolate, &iter.value());

    v8::TryCatch try_catch;
    result.Set(key, child_v8);
    if (try_catch.HasCaught()) {
      LOG(ERROR) << "Setter for property " << key.c_str() << " threw an "
                 << "exception.";
    }
  }

  return result.GetHandle();
}

v8::Local<v8::Value> V8ValueConverter::ToArrayBuffer(
    v8::Isolate* isolate, const base::Value* value) const {
  const char* data = value->GetBuffer();
  size_t length = value->GetSize();

  if (!disable_node_) {
    return node::Buffer::Copy(isolate, data, length).ToLocalChecked();
  }

  if (length > node::Buffer::kMaxLength) {
    return v8::Local<v8::Object>();
  }
  auto context = isolate->GetCurrentContext();
  auto array_buffer = v8::ArrayBuffer::New(isolate, length);
  memcpy(array_buffer->GetContents().Data(), data, length);
  // From this point, if something goes wrong(can't find Buffer class for
  // example) we'll simply return a Uint8Array based on the created ArrayBuffer.
  // This can happen if no preload script was specified to the renderer.
  mate::Dictionary global(isolate, context->Global());
  v8::Local<v8::Value> buffer_value;

  // Get the Buffer class stored as a hidden value in the global object. We'll
  // use it return a browserified Buffer.
  if (!global.GetHidden("Buffer", &buffer_value) ||
      !buffer_value->IsFunction()) {
    return v8::Uint8Array::New(array_buffer, 0, length);
  }

  mate::Dictionary buffer_class(isolate, buffer_value->ToObject());
  v8::Local<v8::Value> from_value;
  if (!buffer_class.Get("from", &from_value) ||
      !from_value->IsFunction()) {
    return v8::Uint8Array::New(array_buffer, 0, length);
  }

  v8::Local<v8::Value> args[] = {
    array_buffer
  };
  auto func = v8::Local<v8::Function>::Cast(from_value);
  auto result = func->Call(context, v8::Null(isolate), 1, args);
  if (!result.IsEmpty()) {
    return result.ToLocalChecked();
  }

  return v8::Uint8Array::New(array_buffer, 0, length);
}

base::Value* V8ValueConverter::FromV8ValueImpl(
    FromV8ValueState* state,
    v8::Local<v8::Value> val,
    v8::Isolate* isolate) const {
  FromV8ValueState::Level state_level(state);
  if (state->HasReachedMaxRecursionDepth())
    return nullptr;

  if (val->IsExternal())
    return base::MakeUnique<base::Value>().release();

  if (val->IsNull())
    return base::MakeUnique<base::Value>().release();

  if (val->IsBoolean())
    return new base::Value(val->ToBoolean()->Value());

  if (val->IsInt32())
    return new base::Value(val->ToInt32()->Value());

  if (val->IsNumber())
    return new base::Value(val->ToNumber()->Value());

  if (val->IsString()) {
    v8::String::Utf8Value utf8(val->ToString());
    return new base::Value(std::string(*utf8, utf8.length()));
  }

  if (val->IsUndefined())
    // JSON.stringify ignores undefined.
    return nullptr;

  if (val->IsDate()) {
    v8::Date* date = v8::Date::Cast(*val);
    v8::Local<v8::Value> toISOString =
        date->Get(v8::String::NewFromUtf8(isolate, "toISOString"));
    if (toISOString->IsFunction()) {
      v8::Local<v8::Value> result =
          toISOString.As<v8::Function>()->Call(val, 0, nullptr);
      if (!result.IsEmpty()) {
        v8::String::Utf8Value utf8(result->ToString());
        return new base::Value(std::string(*utf8, utf8.length()));
      }
    }
  }

  if (val->IsRegExp()) {
    if (!reg_exp_allowed_)
      // JSON.stringify converts to an object.
      return FromV8Object(val->ToObject(), state, isolate);
    return new base::Value(*v8::String::Utf8Value(val->ToString()));
  }

  // v8::Value doesn't have a ToArray() method for some reason.
  if (val->IsArray())
    return FromV8Array(val.As<v8::Array>(), state, isolate);

  if (val->IsFunction()) {
    if (!function_allowed_)
      // JSON.stringify refuses to convert function(){}.
      return nullptr;
    return FromV8Object(val->ToObject(), state, isolate);
  }

  if (node::Buffer::HasInstance(val)) {
    return FromNodeBuffer(val, state, isolate);
  }

  if (val->IsObject()) {
    return FromV8Object(val->ToObject(), state, isolate);
  }

  LOG(ERROR) << "Unexpected v8 value type encountered.";
  return nullptr;
}

base::Value* V8ValueConverter::FromV8Array(
    v8::Local<v8::Array> val,
    FromV8ValueState* state,
    v8::Isolate* isolate) const {
  ScopedUniquenessGuard uniqueness_guard(state, val);
  if (!uniqueness_guard.is_valid())
    return base::MakeUnique<base::Value>().release();

  std::unique_ptr<v8::Context::Scope> scope;
  // If val was created in a different context than our current one, change to
  // that context, but change back after val is converted.
  if (!val->CreationContext().IsEmpty() &&
      val->CreationContext() != isolate->GetCurrentContext())
    scope.reset(new v8::Context::Scope(val->CreationContext()));

  auto* result = new base::ListValue();

  // Only fields with integer keys are carried over to the ListValue.
  for (uint32_t i = 0; i < val->Length(); ++i) {
    v8::TryCatch try_catch;
    v8::Local<v8::Value> child_v8 = val->Get(i);
    if (try_catch.HasCaught()) {
      LOG(ERROR) << "Getter for index " << i << " threw an exception.";
      child_v8 = v8::Null(isolate);
    }

    if (!val->HasRealIndexedProperty(i))
      continue;

    base::Value* child = FromV8ValueImpl(state, child_v8, isolate);
    if (child)
      result->Append(std::unique_ptr<base::Value>(child));
    else
      // JSON.stringify puts null in places where values don't serialize, for
      // example undefined and functions. Emulate that behavior.
      result->Append(base::MakeUnique<base::Value>());
  }
  return result;
}

base::Value* V8ValueConverter::FromNodeBuffer(
    v8::Local<v8::Value> value,
    FromV8ValueState* state,
    v8::Isolate* isolate) const {
  return base::Value::CreateWithCopiedBuffer(
      node::Buffer::Data(value), node::Buffer::Length(value)).release();
}

base::Value* V8ValueConverter::FromV8Object(
    v8::Local<v8::Object> val,
    FromV8ValueState* state,
    v8::Isolate* isolate) const {
  ScopedUniquenessGuard uniqueness_guard(state, val);
  if (!uniqueness_guard.is_valid())
    return base::MakeUnique<base::Value>().release();

  std::unique_ptr<v8::Context::Scope> scope;
  // If val was created in a different context than our current one, change to
  // that context, but change back after val is converted.
  if (!val->CreationContext().IsEmpty() &&
      val->CreationContext() != isolate->GetCurrentContext())
    scope.reset(new v8::Context::Scope(val->CreationContext()));

  std::unique_ptr<base::DictionaryValue> result(new base::DictionaryValue());
  v8::Local<v8::Array> property_names(val->GetOwnPropertyNames());

  for (uint32_t i = 0; i < property_names->Length(); ++i) {
    v8::Local<v8::Value> key(property_names->Get(i));

    // Extend this test to cover more types as necessary and if sensible.
    if (!key->IsString() &&
        !key->IsNumber()) {
      NOTREACHED() << "Key \"" << *v8::String::Utf8Value(key) << "\" "
                      "is neither a string nor a number";
      continue;
    }

    v8::String::Utf8Value name_utf8(key->ToString());

    v8::TryCatch try_catch;
    v8::Local<v8::Value> child_v8 = val->Get(key);

    if (try_catch.HasCaught()) {
      LOG(ERROR) << "Getter for property " << *name_utf8
                 << " threw an exception.";
      child_v8 = v8::Null(isolate);
    }

    std::unique_ptr<base::Value> child(
        FromV8ValueImpl(state, child_v8, isolate));
    if (!child.get())
      // JSON.stringify skips properties whose values don't serialize, for
      // example undefined and functions. Emulate that behavior.
      continue;

    // Strip null if asked (and since undefined is turned into null, undefined
    // too). The use case for supporting this is JSON-schema support,
    // specifically for extensions, where "optional" JSON properties may be
    // represented as null, yet due to buggy legacy code elsewhere isn't
    // treated as such (potentially causing crashes). For example, the
    // "tabs.create" function takes an object as its first argument with an
    // optional "windowId" property.
    //
    // Given just
    //
    //   tabs.create({})
    //
    // this will work as expected on code that only checks for the existence of
    // a "windowId" property (such as that legacy code). However given
    //
    //   tabs.create({windowId: null})
    //
    // there *is* a "windowId" property, but since it should be an int, code
    // on the browser which doesn't additionally check for null will fail.
    // We can avoid all bugs related to this by stripping null.
    if (strip_null_from_objects_ && child->IsType(base::Value::Type::NONE))
      continue;

    result->SetWithoutPathExpansion(std::string(*name_utf8, name_utf8.length()),
                                    child.release());
  }

  return result.release();
}

}  // namespace atom
