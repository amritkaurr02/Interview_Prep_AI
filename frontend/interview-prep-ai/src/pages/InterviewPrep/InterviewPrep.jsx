import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import { toast } from "react-hot-toast";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import QuestionCard from "../../components/Cards/QuestionCard";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import Drawer from "../../components/Drawer";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import AIResponsePreview from "./components/AIResponsePreview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  // Fetch session details
  const fetchSessionDetailsById = async () => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if (data?.session) setSessionData(data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // Generate AI explanation
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const { data } = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (data) setExplanation(data);
    } catch (error) {
      console.error("Error generating explanation:", error);
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pin / Unpin question
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      // Optimistic UI update
      const updatedQuestions = sessionData.questions
        .map((q) =>
          q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
        )
        .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

      setSessionData((prev) => ({ ...prev, questions: updatedQuestions }));

      const { data } = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      // Revert if API fails
      if (!data?.question) {
        setSessionData((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
          ),
        }));
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      // Revert on error
      setSessionData((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
        ),
      }));
    }
  };

  // Load more questions
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added More Q&A!!");
        fetchSessionDetailsById();
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchSessionDetailsById();
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />

      <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
        <h2 className="text-lg font-semibold text-black">Interview Q & A</h2>

        <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
          <div
            className={`col-span-12 ${
              openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
            }`}
          >
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <QuestionCard
                    question={data?.question}
                    answer={data?.answer}
                    onLearnMore={() => generateConceptExplanation(data.question)}
                    isPinned={data?.isPinned}
                    onTogglePin={() => toggleQuestionPinStatus(data._id)}
                  />

                  {!isLoading &&
                    sessionData?.questions?.length === index + 1 && (
                      <div className="flex items-center justify-center mt-5">
                        <button
                          className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded cursor-pointer"
                          disabled={isLoading || isUpdateLoader}
                          onClick={uploadMoreQuestions}
                        >
                          {isUpdateLoader ? (
                            <SpinnerLoader />
                          ) : (
                            <LuListCollapse className="text-lg" />
                          )}
                          Load More
                        </button>
                      </div>
                    )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Drawer
          isOpen={openLeanMoreDrawer}
          onClose={() => setOpenLeanMoreDrawer(false)}
          title={!isLoading && explanation?.title}
        >
          {errorMsg && (
            <p className="flex gap-2 text-sm text-amber-600 font-medium">
              <LuCircleAlert className="mt-1" />
              {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview content={explanation?.explanation} />
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
