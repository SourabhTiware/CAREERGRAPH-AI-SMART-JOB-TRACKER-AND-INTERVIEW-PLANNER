// import { GoogleGenAI } from "@google/genai"
// import {z} from "zod"
// import { zodToJsonSchema } from "zod-to-json-schema"
// import puppeteer from "puppeteer"

// const ai = new GoogleGenAI({
//     apiKey: process.env.GOOGLE_GENAI_API_KEY
// })


// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intension: z.string().describe("The intension of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intension and how to answer them"),
//     behavioralQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intension: z.string().describe("The intension of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intension and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum(["Low", "Medium", "High"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
//     title: z.string().describe("The title of the job for which the interview report is generated"),
// })

// export async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


//     // const prompt = `Generate an interview report for a candidate with the following details:
//     //                     Resume: ${resume}
//     //                     Self Description: ${selfDescription}
//     //                     Job Description: ${jobDescription}

//     //                     Generate an interview report with:
//     //                     - matchScore (0–100)
//     //                     - 5 technicalQuestions
//     //                     - 5 behavioralQuestions
//     //                     - 3 skillGaps
//     //                     - 7 day preparationPlan
//     //                 `


//     const prompt = `
//                 Generate an interview report in STRICT JSON format.

//                 Resume: ${resume}
//                 Self Description: ${selfDescription}
//                 Job Description: ${jobDescription}

//                 Follow this structure EXACTLY.

//                     {
//                     "matchScore": number,

//                     "technicalQuestions": [
//                     {
//                         "question": "string",
//                         "intension": "why interviewer asks this",
//                         "answer": "how candidate should answer"
//                     }
//                     ],

//                     "behavioralQuestions": [
//                     {
//                         "question": "string",
//                         "intension": "why interviewer asks this",
//                         "answer": "how candidate should answer"
//                     }
//                     ],

//                     "skillGaps": [
//                     {
//                         "skill": "string",
//                         "severity": "low | medium | high"
//                     }
//                     ],

//                     "preparationPlan": [
//                     {
//                         "day": number,
//                         "focus": "string",
//                         "tasks": ["task1", "task2"]
//                     }
//                     ],

//                     "title": "job title"
//                     }

//                 Rules:
//                 - technicalQuestions MUST contain 5 objects
//                 - behavioralQuestions MUST contain 5 objects
//                 - skillGaps MUST contain 3 objects
//                 - preparationPlan MUST contain 7 objects
//                 - Return ONLY JSON. No explanation.
//         `

//     try{
//             const response = await ai.models.generateContent({
//             // model: "gemini-3.1-flash-lite-preview",
//             model: "gemini-2.5-pro",
//             contents: prompt,
//             config: {
//                 responseMimeType: "application/json",
//                 responseSchema: zodToJsonSchema(interviewReportSchema),
//             }
//         })

//         // return JSON.parse(response.text)
//         console.log(response.text)
//         const parsed = interviewReportSchema.parse(JSON.parse(response.text))

//         if (!parsed.success) {
//                 console.error(parsed.error)
//                 throw new Error("AI returned invalid structured data")
//             }

//         return parsed

//     } catch (error) {
//            throw new Error("Error in generating interview report: " + error.message);
//         }


// }


// ------------------------------------------------------------------------------------------------

import Groq from "groq-sdk";
import { z } from "zod";
import puppeteer from "puppeteer"

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
        console.error("Error in generateInterviewReport:", error);
        throw new Error("Error in generating interview report: " + error.message);
    }
}

// ------------------------------------------------------------------------------------------------


// export async function generatePdfFromHtml(htmlContent) {
//     const browser = await puppeteer.launch()
//     const page = await browser.newPage();
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" })

//     const pdfBuffer = await page.pdf({
//         format: "A4", margin: {
//             top: "20mm",
//             bottom: "20mm",
//             left: "15mm",
//             right: "15mm"
//         }
//     })

//     await browser.close()

//     return pdfBuffer
// }

// export async function generateResumePdf({ resume, selfDescription, jobDescription }) {

//     const resumePdfSchema = z.object({
//         html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
//     })

//     const prompt = `Generate resume for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}

//                         the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
//                         The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
//                         The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
//                         you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
//                         The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
//                         The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
//                     `

//     // const response = await ai.models.generateContent({
//     //     model: "gemini-3-flash-preview",
//     //     contents: prompt,
//     //     config: {
//     //         responseMimeType: "application/json",
//     //         responseSchema: zodToJsonSchema(resumePdfSchema),
//     //     }
//     // })

//     const response = await groq.chat.completions.create({
//         messages: [
//             {   role: "system", content: "You are a specialized assistant that generates HTML content for resumes based on user input. Your output MUST be a valid JSON object with an 'html' field containing the resume's HTML."},
//             {   role: "user", content: prompt}
//         ],
//         model: "llama-3.3-70b-versatile",
//         temperature: 0.2,
//         stream: false,
//         response_format: { type: "json_object" }
//     })

//     const jsonContent = JSON.parse(response.text)

//     const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

//     return pdfBuffer

// }


// --------------------------------------------------------------------------------------------------


const resumePdfSchema = z.object({
    html: z.string().min(1, "HTML content is required")
});

// export async function generatePdfFromHtml(htmlContent) {
//     // const browser = await puppeteer.launch({
//     //     headless: "new" 
//     // });


//     const browser = await puppeteer.launch({
//         headless: "new", 
//         args: [
//             '--no-sandbox', 
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage', 
//             '--single-process'         
//         ],
       
//         executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null, 
//     });
//     const page = await browser.newPage();
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         margin: {
//             top: "15mm",
//             bottom: "15mm",
//             left: "15mm",
//             right: "15mm"
//         },
//         printBackground: true 
//     });

//     await browser.close();
//     return pdfBuffer;
// }


export async function generatePdfFromHtml(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            // हे Puppeteer ला Chrome शोधायला मदत करेल
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                            (process.platform === 'linux' ? '/usr/bin/google-chrome' : null)
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        return pdfBuffer;
    } catch (error) {
        console.error("PDF Generation Detailed Error:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    // const prompt = `Generate a professional resume in HTML format.
    //                 Resume Data: ${resume}
    //                 Self Description: ${selfDescription}
    //                 Target Job: ${jobDescription}

    //                 REQUIREMENTS:
    //                 - Return ONLY a JSON object with a single key "html".
    //                 - The HTML should be a full document (with <style> tags).
    //                 - Use a professional, ATS-friendly design.
    //                 - Highlight key skills with subtle colors.
    //                 - Keep it to 1-2 pages maximum.
    //                 - Content must sound human-written, not robotic.
    //                 - Ensure the JSON is not truncated.`;

    // const prompt = `Generate a professional, ATS-friendly resume in HTML format.
    // Details:
    // Resume: ${resume}
    // Self Description: ${selfDescription}
    // Job Description: ${jobDescription}

    // HTML/CSS STRUCTURE RULES:
    // 1. Use clean, semantic HTML5 (header, section, article).
    // 2. Use a standard sans-serif font like 'Arial' or 'Helvetica'.
    // 3. Use a two-column layout if possible, or a very clear single-column structure.
    // 4. CSS: Add a small amount of color (e.g., dark blue for headers).
    // 5. ATS Friendly: Do NOT use tables for layout. Use Flexbox or simple <div> margins. 
    // 6. Ensure all contact info (Phone, Email, LinkedIn) is at the top.
    // 7. Section titles (Experience, Skills, Education) should be bold and slightly larger.

    // OUTPUT:
    // Return ONLY a JSON object: { "html": "...full HTML string with <style>..." }`;

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
// --------------------------------------------------------------------------------------------------
