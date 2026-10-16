import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ExamFrame } from "./ExamFrame";
const Hub = lazy(() => import("./ExamHub"));
const Setup = lazy(() => import("./ExamSetup"));
const Play = lazy(() => import("./ExamPlay"));
const Results = lazy(() => import("./ExamResults"));
const Notebook = lazy(() => import("./ExamNotebook"));
const History = lazy(() => import("./ExamHistory"));
const Search = lazy(() => import("./ExamSearch"));
const Print = lazy(() => import("./ExamPrint"));
const Recall = lazy(() => import("./ExamRecall"));
export default function ExamRoutes() {
  return (
    <ExamFrame>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route index element={<Hub />} />
          <Route path="set/:examId" element={<Setup />} />
          <Route path="set/:examId/review" element={<Notebook review />} />
          <Route path="set/:examId/print" element={<Print />} />
          <Route path="set/:examId/recall" element={<Recall />} />
          <Route path="attempt/:attemptId/recall" element={<Recall />} />
          <Route path="attempt/:attemptId" element={<Play />} />
          <Route path="attempt/:attemptId/results" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="notebook" element={<Notebook />} />
          <Route path="wrong" element={<Notebook wrong />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<Hub />} />
        </Routes>
      </Suspense>
    </ExamFrame>
  );
}
