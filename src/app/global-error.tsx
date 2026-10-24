"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Critical root application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#23272E] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-[#E8DFC8] bg-white p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#C55331]">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-normal text-[#23272E]">
              Critical Application Interruption
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              A foundational component failure occurred. Please reload the observatory shell.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center rounded-xl bg-[#C55331] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#98381D] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
