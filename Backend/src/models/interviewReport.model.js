import mongoose from "mongoose";

const technicalQuestionSchema = new mongoose.Schema({

    question: {
        type: String,
        required: [true, "Technical question is required"]
    }, 

    intension:{
        type: String,
        required: [true, "Intension is required"]
    }, 

    answer:{
        type: String,
        required: [true, "Answer is required"]
    }

},{
    _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({

    question: {
        type: String,
        required: [true, "Technical question is required"]
    }, 

    intension:{
        type: String,
        required: [true, "Intension is required"]
    }, 

    answer:{
        type: String,
        required: [true, "Answer is required"]
    }

},{
    _id: false
});


const skillGapSchema = new mongoose.Schema({

    skill: {
        type: String,
        required: [true, "skill is required"]
    },

    severity: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: [true, "Severity is required"]
    }

}, {
    _id: false
});


const preparationPlanSchema = new mongoose.Schema({

    day: {
        type: Number,
        required: [true, "Day is required"]
    },

    focus:{
        type: String,
        required: [true, "Focus is required"]
    }, 

    tasks:[{
        type: String,
        required: [true, "Task is required"]
    }]

});

const interviewReportSchema = new mongoose.Schema({

    jobDescription:{
        type: String,
        required: [true, "Job description is required"]
    },

    resume:{
        type: String
    },

    selfDescription:{
        type: String
    },

    matchScore:{
        type: Number,
        min: 0, 
        max: 100
    },
    technicalQuestions: {
        type: [technicalQuestionSchema],
        default: []
    },

    behavioralQuestions: {
        type: [behavioralQuestionSchema],
        default: []
    },

    skillGaps: {
        type: [skillGapSchema],
        default: []
    },

    preparationPlan: {
        type: [preparationPlanSchema],
        default: []
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    title: { 
        type: String,
        required: [true, "job title is required"]
    }

}, {
    timestamps: true
});


const interviewReportModel = mongoose.model("interviewReport", interviewReportSchema);

export default interviewReportModel;