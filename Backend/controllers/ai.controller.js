
const getStockQuote = require('../getStockQuote');
const aiServices = require('../services/ai.service')

const selectTools = (intent) => {
    const toolMap = {
        TRADING: ['market_data', 'portfolio_checker', 'risk_calculator'],
        PORTFOLIO: ['portfolio_data', 'performance_calculator'],
        MARKET_ANALYSIS: ['price_trend', 'technical_indicators'],
        EDUCATION: ['trading_glossary', 'quiz_creator'],
        GENERAL_CHAT: ['small_talk']
    };
    return toolMap[intent] || ['general_knowledge'];
};



module.exports.aiChat = async (req, res) => {
    const { message } = req.body;

    const user = req.user;
    const userId = req.user.id;
    const category = await aiServices.classifyInput({ userInput: message, userId });
    console.log(category)

    try {

        switch (category) {
            case "TRADING":
                const memory = aiServices.getRecentMemory(userId);
                const previousAi = memory.find(item => item.role === 'ai')?.content.aiReply;

                if (memory.length != 0) {

                    const lastEntities = memory.find(item => item.role === 'meta')?.content.entities;
                    const lastContext = memory.find(item => item.role === 'meta')?.content.context;
                    const riskAssessment = aiServices.assessRisk({ entities: lastEntities, context: lastContext });
                    // console.log(memory)


                    if (previousAi.includes("confirm") && aiServices.isConfirmed(message)) {
                        const lastEntities = memory.find(item => item.role === 'meta')?.content.entities;
                        const lastContext = memory.find(item => item.role === 'meta')?.content.context;

                        const trade = await aiServices.executeTrade({
                            userId,
                            entities: lastEntities,
                            context: lastContext,
                        });
                        const monitoringInterval = aiServices.startTradeMonitoring(getStockQuote, 1);
                        console.log(monitoringInterval)
                        const confirmation = aiServices.formatTradeConfirmation(trade);
                        return res.json({ reply: confirmation });

                    } else {
                        const aiReply = await aiServices.generateAIResponseWithMemory({ entities: lastEntities, context: lastContext, riskAssessment })
                        return res.json({ reply: aiReply });

                    }

                } else if (memory.length == 0) {
                    const entities = await aiServices.extractTradingEntities(message);
                    const context = await aiServices.enrichTradingContext(entities, user);
                    const riskAssessment = aiServices.assessRisk({ entities, context });
                    const tools = selectTools(category);
                    const aiReply = await aiServices.generateAIResponse({ entities, context, riskAssessment })
                    aiServices.saveMessageToMemory(userId, "user", { message });
                    aiServices.saveMessageToMemory(userId, "ai", { aiReply });
                    aiServices.saveMessageToMemory(userId, "meta", { entities, context });
                    return res.json({ aiReply });

                }




            case "PORTFOLIO":
                return res.json({ reply: "Portfolio features coming soon!" });

            case "MARKET_ANALYSIS":
                return res.json({ reply: "Market analysis tools are being integrated." });

            case "EDUCATION":
                return res.json({ reply: "Educational mode is coming soon!" });

            case "GENERAL_CHAT":
                return res.json({ reply: "Hey! I'm your AI trading assistant. Ask me anything." });

            default:
                return res.json({ reply: "I couldn't classify that message. Try again!" });
        }
    } catch (error) {
        console.error("❌ AI Chat Error:", error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};



