// import pdfParse from "pdf-parse";
import * as pdfParse from "pdf-parse";
import {generateInterviewReport, generateResumePdf} from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";
import { success } from "zod";


/**
 * @desc generate interview report on the basis of the user self description resume pdf and job description.
 * @route POST /api/interview
 * @access Private
 */
 const generateInterviewReportController = async (req, res) =>{

    if(!req.file) {
        return res.status(400).json({
            message: "Resume file is required"
        });
    }
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
    const {selfDescription, jobDescription} = req.body;

    try {
         const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user._id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    });

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    });
        
    } catch (err) {
        return res.status(500).json({
            message:"Error in generating interview report",
            error: err.message
        });
    }

};


/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    try {

           const { interviewId } = req.params
            const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user._id })

            if (!interviewReport) {
                return res.status(404).json({
                    message: "Interview report not found."
                })
            }

            res.status(200).json({
                message: "Interview report fetched successfully.",
                interviewReport
            })
        
        }  catch (err) {
    
            if (err.message === "AI_LIMIT_REACHED") {
                return res.status(429).json({
                    message: "AI_LIMIT_REACHED",
                    error: "The AI is currently at its daily limit."
                });
            }

            return res.status(500).json({
                message: "Error in generating interview report",
                error: err.message
            });
        }
    }


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {

    try{
        const interviewReports = await interviewReportModel.find({ user: req.user._id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    }catch(err){
        if(err.message === "AI_LIMIT_REACHED"){
            return res.status(429).json({
                success:false,
                message:"The AI is currently busy due to high demand. Please try again in a few minutes.",
            });
        }
        res.status(500).json({
            success: false,
            message:"Internal server error"
        })
    }

};


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
            const { interviewReportId } = req.params

            const interviewReport = await interviewReportModel.findById({
                _id: interviewReportId,
                user: req.user._id
            })

            if (!interviewReport) {
                return res.status(404).json({
                    message: "Interview report not found or unauthorized."
                })
            }

            const { resume, jobDescription, selfDescription } = interviewReport

            const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
            })

            res.send(pdfBuffer)
        } catch (err) {
            if (err.message === "AI_LIMIT_REACHED") {
                return res.status(429).json({
                    message: "AI_LIMIT_REACHED",
                    error: "The AI is currently at its daily limit for generating PDFs."
                });
            }
            res.status(500).json({ message: "Error in generating resume PDF", error: err.message });
        }
}

/**
 * @description Controller to delete the interview plan 
 */

async function deleteInterviewReportController (req,res) {
    
    try{
        const {id} = req.params;

        const deleteReport = await interviewReportModel.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if(!deleteReport) return res.status(404).json({ message: "Report not found or unauthorized" });

        res.status(200).json({ message: "Report deleted successfully" });
    } catch(err){
        res.status(500).json({message:"Internal server error"});
    }
}

export default {generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, deleteInterviewReportController};