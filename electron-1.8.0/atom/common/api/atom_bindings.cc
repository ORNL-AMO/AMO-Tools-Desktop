// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/api/atom_bindings.h"

#include <algorithm>
#include <iostream>
#include <string>

#include "atom/common/atom_version.h"
#include "atom/common/chrome_version.h"
#include "atom/common/native_mate_converters/string16_converter.h"
#include "atom/common/node_includes.h"
#include "base/logging.h"
#include "base/sys_info.h"
#include "native_mate/dictionary.h"

namespace atom {

namespace {

// Dummy class type that used for crashing the program.
struct DummyClass { bool crash; };

// Called when there is a fatal error in V8, we just crash the process here so
// we can get the stack trace.
void FatalErrorCallback(const char* location, const char* message) {
  LOG(ERROR) << "Fatal error in V8: " << location << " " << message;
  AtomBindings::Crash();
}

}  // namespace


AtomBindings::AtomBindings(uv_loop_t* loop) {
  uv_async_init(loop, &call_next_tick_async_, OnCallNextTick);
  call_next_tick_async_.data = this;
  metrics_ = base::ProcessMetrics::CreateCurrentProcessMetrics();
}

AtomBindings::~AtomBindings() {
  uv_close(reinterpret_cast<uv_handle_t*>(&call_next_tick_async_), nullptr);
}

void AtomBindings::BindTo(v8::Isolate* isolate,
                          v8::Local<v8::Object> process) {
  v8::V8::SetFatalErrorHandler(FatalErrorCallback);

  mate::Dictionary dict(isolate, process);
  dict.SetMethod("crash", &AtomBindings::Crash);
  dict.SetMethod("hang", &Hang);
  dict.SetMethod("log", &Log);
  dict.SetMethod("getProcessMemoryInfo", &GetProcessMemoryInfo);
  dict.SetMethod("getSystemMemoryInfo", &GetSystemMemoryInfo);
  dict.SetMethod("getCPUUsage",
      base::Bind(&AtomBindings::GetCPUUsage, base::Unretained(this)));
  dict.SetMethod("getIOCounters", &GetIOCounters);
#if defined(OS_POSIX)
  dict.SetMethod("setFdLimit", &base::SetFdLimit);
#endif
  dict.SetMethod("activateUvLoop",
      base::Bind(&AtomBindings::ActivateUVLoop, base::Unretained(this)));

#if defined(MAS_BUILD)
  dict.Set("mas", true);
#endif

  mate::Dictionary versions;
  if (dict.Get("versions", &versions)) {
    // TODO(kevinsawicki): Make read-only in 2.0 to match node
    versions.Set(ATOM_PROJECT_NAME, ATOM_VERSION_STRING);
    versions.Set("chrome", CHROME_VERSION_STRING);

    // TODO(kevinsawicki): Remove in 2.0
    versions.Set("atom-shell", ATOM_VERSION_STRING);
  }
}

void AtomBindings::EnvironmentDestroyed(node::Environment* env) {
  auto it = std::find(pending_next_ticks_.begin(), pending_next_ticks_.end(),
                      env);
  if (it != pending_next_ticks_.end())
    pending_next_ticks_.erase(it);
}

void AtomBindings::ActivateUVLoop(v8::Isolate* isolate) {
  node::Environment* env = node::Environment::GetCurrent(isolate);
  if (std::find(pending_next_ticks_.begin(), pending_next_ticks_.end(), env) !=
      pending_next_ticks_.end())
    return;

  pending_next_ticks_.push_back(env);
  uv_async_send(&call_next_tick_async_);
}

// static
void AtomBindings::OnCallNextTick(uv_async_t* handle) {
  AtomBindings* self = static_cast<AtomBindings*>(handle->data);
  for (std::list<node::Environment*>::const_iterator it =
           self->pending_next_ticks_.begin();
       it != self->pending_next_ticks_.end(); ++it) {
    node::Environment* env = *it;
    // KickNextTick, copied from node.cc:
    node::Environment::AsyncCallbackScope callback_scope(env);
    if (callback_scope.in_makecallback())
      continue;
    node::Environment::TickInfo* tick_info = env->tick_info();
    if (tick_info->length() == 0)
      env->isolate()->RunMicrotasks();
    v8::Local<v8::Object> process = env->process_object();
    if (tick_info->length() == 0)
      tick_info->set_index(0);
    env->tick_callback_function()->Call(process, 0, nullptr).IsEmpty();
  }

  self->pending_next_ticks_.clear();
}

// static
void AtomBindings::Log(const base::string16& message) {
  std::cout << message << std::flush;
}

// static
void AtomBindings::Crash() {
  static_cast<DummyClass*>(nullptr)->crash = true;
}

// static
void AtomBindings::Hang() {
  for (;;)
    base::PlatformThread::Sleep(base::TimeDelta::FromSeconds(1));
}

// static
v8::Local<v8::Value> AtomBindings::GetProcessMemoryInfo(v8::Isolate* isolate) {
  std::unique_ptr<base::ProcessMetrics> metrics(
      base::ProcessMetrics::CreateCurrentProcessMetrics());

  mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
  dict.Set("workingSetSize",
           static_cast<double>(metrics->GetWorkingSetSize() >> 10));
  dict.Set("peakWorkingSetSize",
           static_cast<double>(metrics->GetPeakWorkingSetSize() >> 10));

  size_t private_bytes, shared_bytes;
  if (metrics->GetMemoryBytes(&private_bytes, &shared_bytes)) {
    dict.Set("privateBytes", static_cast<double>(private_bytes >> 10));
    dict.Set("sharedBytes", static_cast<double>(shared_bytes >> 10));
  }

  return dict.GetHandle();
}

// static
v8::Local<v8::Value> AtomBindings::GetSystemMemoryInfo(v8::Isolate* isolate,
    mate::Arguments* args) {
  base::SystemMemoryInfoKB mem_info;
  if (!base::GetSystemMemoryInfo(&mem_info)) {
    args->ThrowError("Unable to retrieve system memory information");
    return v8::Undefined(isolate);
  }

  mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
  dict.Set("total", mem_info.total);

  // See Chromium's "base/process/process_metrics.h" for an explanation.
  int free =
#if defined(OS_WIN)
      mem_info.avail_phys;
#else
      mem_info.free;
#endif
  dict.Set("free", free);

  // NB: These return bogus values on macOS
#if !defined(OS_MACOSX)
  dict.Set("swapTotal", mem_info.swap_total);
  dict.Set("swapFree", mem_info.swap_free);
#endif

  return dict.GetHandle();
}

v8::Local<v8::Value> AtomBindings::GetCPUUsage(v8::Isolate* isolate) {
  mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);
  int processor_count = base::SysInfo::NumberOfProcessors();
  dict.Set("percentCPUUsage",
           metrics_->GetPlatformIndependentCPUUsage() / processor_count);
  dict.Set("idleWakeupsPerSecond", metrics_->GetIdleWakeupsPerSecond());

  return dict.GetHandle();
}

// static
v8::Local<v8::Value> AtomBindings::GetIOCounters(v8::Isolate* isolate) {
  std::unique_ptr<base::ProcessMetrics> metrics(
      base::ProcessMetrics::CreateCurrentProcessMetrics());
  base::IoCounters io_counters;
  mate::Dictionary dict = mate::Dictionary::CreateEmpty(isolate);

  if (metrics->GetIOCounters(&io_counters)) {
    dict.Set("readOperationCount", io_counters.ReadOperationCount);
    dict.Set("writeOperationCount", io_counters.WriteOperationCount);
    dict.Set("otherOperationCount", io_counters.OtherOperationCount);
    dict.Set("readTransferCount", io_counters.ReadTransferCount);
    dict.Set("writeTransferCount", io_counters.WriteTransferCount);
    dict.Set("otherTransferCount", io_counters.OtherTransferCount);
  }

  return dict.GetHandle();
}

}  // namespace atom
