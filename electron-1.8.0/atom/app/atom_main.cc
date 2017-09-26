// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/app/atom_main.h"

#include <stdlib.h>

#if defined(OS_WIN)
#include <windows.h>  // windows.h must be included first

#include <atlbase.h>  // ensures that ATL statics like `_AtlWinModule` are initialized (it's an issue in static debug build)
#include <shellapi.h>
#include <shellscalingapi.h>
#include <tchar.h>

#include "atom/app/atom_main_delegate.h"
#include "atom/common/crash_reporter/win/crash_service_main.h"
#include "base/environment.h"
#include "base/process/launch.h"
#include "base/win/windows_version.h"
#include "content/public/app/sandbox_helper_win.h"
#include "sandbox/win/src/sandbox_types.h"
#elif defined(OS_LINUX)  // defined(OS_WIN)
#include "atom/app/atom_main_delegate.h"  // NOLINT
#include "content/public/app/content_main.h"
#else  // defined(OS_LINUX)
#include "atom/app/atom_library_main.h"
#endif  // defined(OS_MACOSX)

#include "atom/app/node_main.h"
#include "atom/common/atom_command_line.h"
#include "base/at_exit.h"
#include "base/i18n/icu_util.h"

namespace {

const auto kRunAsNode = "ELECTRON_RUN_AS_NODE";

bool IsEnvSet(const char* name) {
#if defined(OS_WIN)
  size_t required_size;
  getenv_s(&required_size, nullptr, 0, name);
  return required_size != 0;
#else
  char* indicator = getenv(name);
  return indicator && indicator[0] != '\0';
#endif
}

}  // namespace

#if defined(OS_WIN)
int APIENTRY wWinMain(HINSTANCE instance, HINSTANCE, wchar_t* cmd, int) {
  int argc = 0;
  wchar_t** wargv = ::CommandLineToArgvW(::GetCommandLineW(), &argc);

  bool run_as_node = IsEnvSet(kRunAsNode);

#ifdef _DEBUG
  // Don't display assert dialog boxes in CI test runs
  static const auto kCI = "ELECTRON_CI";
  bool is_ci = IsEnvSet(kCI);
  if (!is_ci) {
    for (int i = 0; i < argc; ++i) {
      if (!_wcsicmp(wargv[i], L"--ci")) {
        is_ci = true;
        _putenv_s(kCI, "1");  // set flag for child processes
        break;
      }
    }
  }
  if (is_ci) {
    _CrtSetReportMode(_CRT_ERROR, _CRTDBG_MODE_DEBUG | _CRTDBG_MODE_FILE);
    _CrtSetReportFile(_CRT_ERROR, _CRTDBG_FILE_STDERR);

    _CrtSetReportMode(_CRT_ASSERT, _CRTDBG_MODE_DEBUG | _CRTDBG_MODE_FILE);
    _CrtSetReportFile(_CRT_ASSERT, _CRTDBG_FILE_STDERR);

    _set_error_mode(_OUT_TO_STDERR);
  }
#endif

  // Make sure the output is printed to console.
  if (run_as_node || !IsEnvSet("ELECTRON_NO_ATTACH_CONSOLE"))
    base::RouteStdioToConsole(false);

  // Convert argv to to UTF8
  char** argv = new char*[argc];
  for (int i = 0; i < argc; i++) {
    // Compute the size of the required buffer
    DWORD size = WideCharToMultiByte(CP_UTF8,
                                     0,
                                     wargv[i],
                                     -1,
                                     NULL,
                                     0,
                                     NULL,
                                     NULL);
    if (size == 0) {
      // This should never happen.
      fprintf(stderr, "Could not convert arguments to utf8.");
      exit(1);
    }
    // Do the actual conversion
    argv[i] = new char[size];
    DWORD result = WideCharToMultiByte(CP_UTF8,
                                       0,
                                       wargv[i],
                                       -1,
                                       argv[i],
                                       size,
                                       NULL,
                                       NULL);
    if (result == 0) {
      // This should never happen.
      fprintf(stderr, "Could not convert arguments to utf8.");
      exit(1);
    }
  }

#ifndef DEBUG
  // Chromium has its own TLS subsystem which supports automatic destruction
  // of thread-local data, and also depends on memory allocation routines
  // provided by the CRT. The problem is that the auto-destruction mechanism
  // uses a hidden feature of the OS loader which calls a callback on thread
  // exit, but only after all loaded DLLs have been detached. Since the CRT is
  // also a DLL, it happens that by the time Chromium's `OnThreadExit` function
  // is called, the heap functions, though still in memory, no longer perform
  // their duties, and when Chromium calls `free` on its buffer, it triggers
  // an access violation error.
  // We work around this problem by invoking Chromium's `OnThreadExit` in time
  // from within the CRT's atexit facility, ensuring the heap functions are
  // still active. The second invocation from the OS loader will be a no-op.
  extern void NTAPI OnThreadExit(PVOID module, DWORD reason, PVOID reserved);
  atexit([]() {
    OnThreadExit(nullptr, DLL_THREAD_DETACH, nullptr);
  });
#endif

  if (run_as_node) {
    // Now that argv conversion is done, we can finally start.
    base::AtExitManager atexit_manager;
    base::i18n::InitializeICU();
    return atom::NodeMain(argc, argv);
  } else if (IsEnvSet("ELECTRON_INTERNAL_CRASH_SERVICE")) {
    return crash_service::Main(cmd);
  }

  sandbox::SandboxInterfaceInfo sandbox_info = {0};
  content::InitializeSandboxInfo(&sandbox_info);
  atom::AtomMainDelegate delegate;

  content::ContentMainParams params(&delegate);
  params.instance = instance;
  params.sandbox_info = &sandbox_info;
  atom::AtomCommandLine::Init(argc, argv);
  atom::AtomCommandLine::InitW(argc, wargv);
  return content::ContentMain(params);
}

#elif defined(OS_LINUX)  // defined(OS_WIN)

int main(int argc, const char* argv[]) {
  if (IsEnvSet(kRunAsNode)) {
    base::i18n::InitializeICU();
    base::AtExitManager atexit_manager;
    return atom::NodeMain(argc, const_cast<char**>(argv));
  }

  atom::AtomMainDelegate delegate;
  content::ContentMainParams params(&delegate);
  params.argc = argc;
  params.argv = argv;
  atom::AtomCommandLine::Init(argc, argv);
  return content::ContentMain(params);
}

#else  // defined(OS_LINUX)

int main(int argc, const char* argv[]) {
  if (IsEnvSet(kRunAsNode)) {
    return AtomInitializeICUandStartNode(argc, const_cast<char**>(argv));
  }

  return AtomMain(argc, argv);
}

#endif  // defined(OS_MACOSX)
