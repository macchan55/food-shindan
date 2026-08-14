"use client";
import type { QuestionForClient } from "@/lib/diagnosis/repository";

// Module-level (not React state) on purpose: the question bank is the same for every
// session, so the very first call — fired from StartButton the moment the diagnosis intro
// page mounts, well before the user finishes reading it and taps 診断をはじめる — is the
// only network request that ever needs to happen. Every later caller (the flow page itself,
// or a same-tab restart) reuses the in-flight/resolved promise instead of re-fetching.
let inFlight: Promise<QuestionForClient[]> | null = null;

export function prefetchQuestions(): Promise<QuestionForClient[]> {
  if (!inFlight) {
    inFlight = fetch("/api/diagnosis/questions")
      .then((r) => {
        if (!r.ok) throw new Error("質問の取得に失敗しました");
        return r.json();
      })
      .then((d) => d.questions as QuestionForClient[])
      .catch((err) => {
        inFlight = null; // let the next caller retry instead of caching a permanent failure
        throw err;
      });
  }
  return inFlight;
}
