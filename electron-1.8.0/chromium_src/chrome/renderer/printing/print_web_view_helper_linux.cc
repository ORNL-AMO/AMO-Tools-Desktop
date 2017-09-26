// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/renderer/printing/print_web_view_helper.h"

#include <memory>

#include "base/logging.h"
#include "chrome/common/print_messages.h"
#include "content/public/renderer/render_thread.h"
#include "printing/metafile_skia_wrapper.h"
#include "printing/page_size_margins.h"
#include "printing/pdf_metafile_skia.h"
#include "third_party/WebKit/public/web/WebLocalFrame.h"

#if !defined(OS_CHROMEOS) && !defined(OS_ANDROID)
#include "base/process/process_handle.h"
#else
#include "base/file_descriptor_posix.h"
#endif  // !defined(OS_CHROMEOS) && !defined(OS_ANDROID)

namespace printing {

using blink::WebLocalFrame;

bool PrintWebViewHelper::RenderPreviewPage(
    int page_number,
    const PrintMsg_Print_Params& print_params) {
  PrintMsg_PrintPage_Params page_params;
  page_params.params = print_params;
  page_params.page_number = page_number;
  std::unique_ptr<PdfMetafileSkia> draft_metafile;
  PdfMetafileSkia* initial_render_metafile = print_preview_context_.metafile();
  if (print_preview_context_.IsModifiable() && is_print_ready_metafile_sent_) {
    draft_metafile.reset(new PdfMetafileSkia(PDF_SKIA_DOCUMENT_TYPE));
    initial_render_metafile = draft_metafile.get();
  }

  base::TimeTicks begin_time = base::TimeTicks::Now();
  PrintPageInternal(page_params,
                    print_preview_context_.prepared_frame(),
                    initial_render_metafile);
  print_preview_context_.RenderedPreviewPage(
      base::TimeTicks::Now() - begin_time);
  if (draft_metafile.get()) {
    draft_metafile->FinishDocument();
  } else if (print_preview_context_.IsModifiable() &&
             print_preview_context_.generate_draft_pages()) {
    DCHECK(!draft_metafile.get());
    draft_metafile =
        print_preview_context_.metafile()->GetMetafileForCurrentPage(
            PDF_SKIA_DOCUMENT_TYPE);

  }
  return PreviewPageRendered(page_number, draft_metafile.get());
}

bool PrintWebViewHelper::PrintPagesNative(blink::WebLocalFrame* frame,
                                          int page_count) {
  PdfMetafileSkia metafile(PDF_SKIA_DOCUMENT_TYPE);
  if (!metafile.Init())
    return false;

  const PrintMsg_PrintPages_Params& params = *print_pages_params_;
  std::vector<int> printed_pages;

  if (params.pages.empty()) {
    for (int i = 0; i < page_count; ++i) {
      printed_pages.push_back(i);
    }
  } else {
    // TODO(vitalybuka): redesign to make more code cross platform.
    for (size_t i = 0; i < params.pages.size(); ++i) {
      if (params.pages[i] >= 0 && params.pages[i] < page_count) {
        printed_pages.push_back(params.pages[i]);
      }
    }
  }

  if (printed_pages.empty())
    return false;

  PrintMsg_PrintPage_Params page_params;
  page_params.params = params.params;
  for (size_t i = 0; i < printed_pages.size(); ++i) {
    page_params.page_number = printed_pages[i];
    PrintPageInternal(page_params, frame, &metafile);
  }

  // blink::printEnd() for PDF should be called before metafile is closed.
  FinishFramePrinting();

  metafile.FinishDocument();

  PrintHostMsg_DidPrintPage_Params printed_page_params;
  if (!CopyMetafileDataToSharedMem(
          metafile, &printed_page_params.metafile_data_handle)) {
    return false;
  }

  printed_page_params.data_size = metafile.GetDataSize();
  printed_page_params.document_cookie = params.params.document_cookie;

  for (size_t i = 0; i < printed_pages.size(); ++i) {
    printed_page_params.page_number = printed_pages[i];
    Send(new PrintHostMsg_DidPrintPage(routing_id(), printed_page_params));
    // Send the rest of the pages with an invalid metafile handle.
    printed_page_params.metafile_data_handle.fd = -1;
  }
  return true;
}

void PrintWebViewHelper::PrintPageInternal(
    const PrintMsg_PrintPage_Params& params,
    WebLocalFrame* frame,
    PdfMetafileSkia* metafile) {
  PageSizeMargins page_layout_in_points;
  double scale_factor = 1.0f;
  ComputePageLayoutInPointsForCss(frame, params.page_number, params.params,
                                  ignore_css_margins_, &scale_factor,
                                  &page_layout_in_points);
  gfx::Size page_size;
  gfx::Rect content_area;
  GetPageSizeAndContentAreaFromPageLayout(page_layout_in_points, &page_size,
                                          &content_area);
  gfx::Rect canvas_area = content_area;

  cc::PaintCanvas* canvas =
      metafile->GetVectorCanvasForNewPage(page_size, canvas_area, scale_factor);
  if (!canvas)
    return;

  MetafileSkiaWrapper::SetMetafileOnCanvas(canvas, metafile);

  RenderPageContent(frame, params.page_number, canvas_area, content_area,
                    scale_factor, canvas);

  // Done printing. Close the device context to retrieve the compiled metafile.
  if (!metafile->FinishPage())
    NOTREACHED() << "metafile failed";
}

}  // namespace printing
