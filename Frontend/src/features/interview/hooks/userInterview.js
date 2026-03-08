import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteReportApi } from "../services/interview.api.js"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.contex.jsx"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport) 
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if(response && response.interviewReport){
                setReport(response.interviewReport)
                return response.interviewReport
            }

        } catch (error) {
            console.log("API error", error)
        } finally {
            setLoading(false)
        }
        // return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
       catch (error) {
        if (error.message === "AI_LIMIT_REACHED") {
            alert("The AI is taking a rest! You hit the maximum number of requests for today. See you tomorrow for more career insights!");
        } else {
            console.error("PDF download failed:", error);
            alert("Something went wrong while downloading. Please try again.");
        }
    } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (id) => {
        try {
            await deleteReportApi(id);

            setReports(prev => prev.filter(report => report._id !== id));
            
        } catch (err) {
            console.error("Delete failed", err);
            alert("Can't delete report, please try again");
        }
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }

}