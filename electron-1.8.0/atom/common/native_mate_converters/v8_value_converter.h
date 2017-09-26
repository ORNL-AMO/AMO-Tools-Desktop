// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_COMMON_NATIVE_MATE_CONVERTERS_V8_VALUE_CONVERTER_H_
#define ATOM_COMMON_NATIVE_MATE_CONVERTERS_V8_VALUE_CONVERTER_H_

#include "base/compiler_specific.h"
#include "base/macros.h"
#include "v8/include/v8.h"

namespace base {
class DictionaryValue;
class ListValue;
class Value;
}

namespace atom {

class V8ValueConverter {
 public:
  V8ValueConverter();

  void SetRegExpAllowed(bool val);
  void SetFunctionAllowed(bool val);
  void SetStripNullFromObjects(bool val);
  void SetDisableNode(bool val);
  v8::Local<v8::Value> ToV8Value(const base::Value* value,
                                 v8::Local<v8::Context> context) const;
  base::Value* FromV8Value(v8::Local<v8::Value> value,
                           v8::Local<v8::Context> context) const;

 private:
  class FromV8ValueState;
  class ScopedUniquenessGuard;

  v8::Local<v8::Value> ToV8ValueImpl(v8::Isolate* isolate,
                                     const base::Value* value) const;
  v8::Local<v8::Value> ToV8Array(v8::Isolate* isolate,
                                 const base::ListValue* list) const;
  v8::Local<v8::Value> ToV8Object(
      v8::Isolate* isolate,
      const base::DictionaryValue* dictionary) const;
  v8::Local<v8::Value> ToArrayBuffer(
      v8::Isolate* isolate,
      const base::Value* value) const;

  base::Value* FromV8ValueImpl(FromV8ValueState* state,
                               v8::Local<v8::Value> value,
                               v8::Isolate* isolate) const;
  base::Value* FromV8Array(v8::Local<v8::Array> array,
                           FromV8ValueState* state,
                           v8::Isolate* isolate) const;
  base::Value* FromNodeBuffer(v8::Local<v8::Value> value,
                              FromV8ValueState* state,
                              v8::Isolate* isolate) const;
  base::Value* FromV8Object(v8::Local<v8::Object> object,
                            FromV8ValueState* state,
                            v8::Isolate* isolate) const;

  // If true, we will convert RegExp JavaScript objects to string.
  bool reg_exp_allowed_;

  // If true, we will convert Function JavaScript objects to dictionaries.
  bool function_allowed_;

  // If true, will not use node::Buffer::Copy to deserialize byte arrays.
  // node::Buffer::Copy depends on a working node.js environment, and this is
  // not desirable in sandboxed renderers. That means Buffer instances sent from
  // browser process will be deserialized as browserify-based Buffer(which are
  // wrappers around Uint8Array).
  bool disable_node_;

  // If true, undefined and null values are ignored when converting v8 objects
  // into Values.
  bool strip_null_from_objects_;

  DISALLOW_COPY_AND_ASSIGN(V8ValueConverter);
};

}  // namespace atom

#endif  // ATOM_COMMON_NATIVE_MATE_CONVERTERS_V8_VALUE_CONVERTER_H_
