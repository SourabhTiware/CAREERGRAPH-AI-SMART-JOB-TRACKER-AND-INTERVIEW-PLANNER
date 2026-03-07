import Groq from "groq-sdk";
import { z } from "zod";
// import puppeteer from "puppeteer"
import html_to_pdf from 'html-pdf-node';

// Zod schema 
    const interviewReportSchema = z.object({
        matchScore: z.number(),
        technicalQuestions: z.array(z.object({
            question: z.string(),
            intension: z.string(),
            answer: z.string()
        })).min(1), 
        
        behavioralQuestions: z.array(z.object({
            question: z.string(),
            intension: z.string(),
            answer: z.string()
        })).min(1),

        skillGaps: z.array(z.object({
            skill: z.string(),
            severity: z.preprocess(
                (val) => {
                    const s = String(val).toLowerCase();
                    return s.charAt(0).toUpperCase() + s.slice(1);
                },
                z.enum(["Low", "Medium", "High"])
            )
        })).min(1),

        preparationPlan: z.array(z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })).min(1),
        
        title: z.string()
    });

// groq client setup 
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    
    
   const prompt = `
            You are a professional HR Interviewer. Generate a detailed interview report in JSON.
            
            Resume: ${resume}
            Self Description: ${selfDescription}
            Job Description: ${jobDescription}

            RETURN ONLY A VALID JSON OBJECT FOLLOWING THIS STRUCTURE:
            {
            "matchScore": number,
            "technicalQuestions": [{"question": "string", "intension": "string", "answer": "string"}],
            "behavioralQuestions": [{"question": "string", "intension": "string", "answer": "string"}],
            "skillGaps": [{"skill": "string", "severity": "Low or Medium or High"}],
            "preparationPlan": [{"day": number, "focus": "string", "tasks": ["string"]}],
            "title": "job title"
            }

            Rules:
            - severity MUST be exactly one of: "Low", "Medium", "High" (First letter capital).
            - Return ONLY JSON. No explanation.

            CRITICAL INSTRUCTIONS:
                1. matchScore MUST be an integer between 0 and 100 based on the resume's alignment with the Job Description.
                2. You MUST provide EXACTLY 5 objects in technicalQuestions, 5 in behavioralQuestions, and 7 in preparationPlan.
                3. Each "answer" field should be detailed (at least 2-3 sentences).
                4. Ensure the JSON is complete and not cut off.
        `;

    try {
        // call groq api
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a specialized career assistant that only outputs valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", 
            temperature: 0.3,
            stream: false,
            response_format: { type: "json_object" }
        });

        const rawResponse = chatCompletion.choices[0]?.message?.content;

        if (!rawResponse) {
            throw new Error("No response received from Groq.");
        }

        
        const jsonResponse = JSON.parse(rawResponse);
        const parsedData = interviewReportSchema.safeParse(jsonResponse);

        if (!parsedData.success) {
            console.error("Zod Validation Error:", parsedData.error.format());
            throw new Error("AI returned data in wrong format. Please try again.");
        }

        // console.log("Interview Report Generated Successfully");
        return parsedData.data;

    } catch (error) {

        if(error.status === 429){
            console.error("Groq Rate Limit Hit. Retry after:", error.headers['retry-after']);
            throw new Error("AI_LIMIT_REACHED");

        }
        throw  error
    }
}



const resumePdfSchema = z.object({
    html: z.string().min(1, "HTML content is required")
});

export async function generatePdfFromHtml(htmlContent) {
    try {

        let options = { 
            format: 'A4', 
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            }
        };

        let file = { content: htmlContent };

        const pdfBuffer = await html_to_pdf.generatePdf(file, options);
        
        return pdfBuffer;
    } catch (error) {
        console.error("PDF Generation Error (html-pdf-node):", error);
        throw error;
    }
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `
        You are an expert Resume Strategist and ATS (Applicant Tracking System) Optimizer.
        Analyze the candidate data and generate a high-scoring, ATS-compliant resume in HTML format.

        CANDIDATE DATA:
        - Original Resume: ${resume}
        - Self Description: ${selfDescription}
        - Targeted Job Description: ${jobDescription}

        CRITICAL ATS FORMATTING RULES (Must Follow):
        1. LAYOUT: Strictly use a SINGLE-COLUMN layout. No tables, no sidebars, no multi-column grids.
        2. STRUCTURE: Use semantic HTML5: <header> for contact, <section> for categories, <ul>/<li> for points.
        3. FONT: Use clean, standard fonts: Arial, Helvetica, or sans-serif. Body font size 10-11pt, Headers 14-16pt.
        4. NO GRAPHICS: Avoid icons, progress bars, images, or complex shapes.
        5. SECTION HEADERS: Use standard titles like "Professional Summary", "Work Experience", "Technical Skills", "Education", and "Projects".
        6. KEYWORDS: Naturally integrate relevant keywords from the provided Job Description into the summary and experience sections.

        CSS STYLING (Professional & Clean):
        - Add a <style> tag with:
            - body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; }
            - .container { width: 100%; max-width: 800px; margin: auto; }
            - h1 { border-bottom: 2px solid #2c3e50; padding-bottom: 5px; color: #2c3e50; }
            - h2 { color: #2c3e50; margin-top: 20px; border-bottom: 1px solid #ddd; text-transform: uppercase; font-size: 16px; }
            - .job-title { font-weight: bold; display: flex; justify-content: space-between; }
            - .date { font-style: italic; color: #666; }
            - ul { padding-left: 20px; }

        JSON OUTPUT REQUIREMENT:
        Return ONLY a JSON object: { "html": "...full HTML document string..." }
    `;

    try {
       
        const response = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are a specialized assistant that generates structured HTML for resumes. Your output MUST be a valid JSON object with an 'html' field." 
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, 
            stream: false,
            response_format: { type: "json_object" }
        });

       
        const rawResponse = response.choices[0]?.message?.content;

        if (!rawResponse) {
            throw new Error("No content received from Groq.");
        }

        const jsonContent = JSON.parse(rawResponse);

        
        const parsedData = resumePdfSchema.safeParse(jsonContent);
        if (!parsedData.success) {
            console.error("Zod Validation Error:", parsedData.error.format());
            throw new Error("AI returned invalid HTML structure.");
        }

        
        const pdfBuffer = await generatePdfFromHtml(parsedData.data.html);

        return pdfBuffer;

    } catch (error) {
        console.error("Error in generateResumePdf:", error);
        throw new Error("Failed to generate Resume PDF: " + error.message);
    }
}

