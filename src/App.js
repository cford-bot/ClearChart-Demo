import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

// Embedded Knowledge Base
const KNOWLEDGE_BASE = {
  emsDocumentation: `EMS NARRATIVE DOCUMENTATION BEST PRACTICES

CORE ELEMENTS:
• Chief Complaint: Document in patient's own words, include duration for neuro patients
• Medical Necessity: Always include why transport is needed
• Initial Assessment: Neuro/Airway, Respiratory/CV, Physical Exam, Labs/Imaging
• Medications & Interventions: Document all pre-arrival and en-route care
• Transport & Reassessments: Continuous monitoring, final disposition

NARRATIVE FORMATS: SOAP, CHART, or Chronological Paragraph

SPECIAL DOCUMENTATION:
- Ventilator: Settings, parameters, ETCO2 waveform required
- Cardiac: Continuous monitoring, 12-lead for cardiac complaints
- Advanced Airway/RSI: Rationale, technique, confirmation methods
- Stroke/STEMI: Onset/LKW time, scales, prenotification, blood glucose
- Pediatrics: Weight/length tape, glucose, temp, restraint method
- Trauma: MOI, cabin temp, hypothermia prevention, prenotification
- Blood Products: Type, unit number, expiration, vitals, reactions
- Patient Refusals: Medical direction, informed consent discussion, signature

KEY COMPLIANCE:
• Medical necessity statement in narrative
• Document pertinent negatives
• Prenotification for STEMI, CVA, trauma, unstable patients
• Document oxygen as medication
• Blood glucose for AMS and neuro patients`,

  protocolSummary: `NY STATE EMS PROTOCOLS V25.1 (Effective 07/01/2025)

KEY PROTOCOL CATEGORIES:

CARDIAC ARREST:
- General Approach: CPR 100-120/min, minimize interruptions, AED/defibrillation
- Asystole/PEA: Epinephrine 1mg IV q3-5min, treat reversible causes
- VF/VT: Defibrillate, Epinephrine, Amiodarone 300mg or Lidocaine 1.5mg/kg
- ROSC: Maintain MAP>65 or SBP>100, consider Norepinephrine
- Pediatric: 15:2 ratio (2 rescuers), Epi 0.01mg/kg, pediatric pads <25kg

RESPIRATORY:
- Respiratory Failure: BVM, airway adjuncts, suction, position
- Asthma/COPD: Albuterol 2.5mg neb, may add Ipratropium, CPAP if equipped
- Pulmonary Edema: Sit upright, CPAP, Nitroglycerin 0.4mg SL
- Pediatric Asthma: Albuterol neb, Epinephrine 0.01mg/kg for severe
- Stridor: Racemic Epi or Epi 3mg neb, Dexamethasone

CARDIAC:
- STEMI: Aspirin 324mg chewed, NTG 0.4mg SL, 12-lead, transport to PCI facility
- Chest Pain: Aspirin, NTG if SBP>120, vascular access
- Bradycardia: Atropine 1mg IV if symptomatic, transcutaneous pacing
- Tachycardia Narrow: Adenosine 6mg then 12mg, or Diltiazem 0.25mg/kg
- Tachycardia Wide: Synchronized cardioversion if unstable

NEUROLOGICAL:
- Stroke: LKW time, Cincinnati scale, glucose check, transport to stroke center
- Seizures: Midazolam 10mg IM/IN or 5mg IV, may repeat
- Altered Mental Status: Check glucose, oxygen, assess for reversible causes
- Hypoglycemia: Oral glucose if alert, Dextrose 10% up to 25g IV

SHOCK:
- Hemorrhagic: Control bleeding, tourniquets, NS 500mL bolus, TXA if equipped
- Septic: NS bolus, consider Norepinephrine if SBP<100
- Anaphylaxis: Epinephrine 0.3mg IM, repeat in 5min if needed, Albuterol
- Cardiogenic: Position supine unless dyspneic, NS cautiously

TRAUMA:
- Hemorrhage Control: Direct pressure, hemostatic dressing, tourniquet if needed
- Chest Trauma: Occlusive dressing for sucking chest wound
- Burns: Stop burning, remove jewelry, dry sterile dressings
- Spinal Motion Restriction: Cervical collar + secure to stretcher

PEDIATRIC CONSIDERATIONS:
- Dosing: Weight-based using length-based tape
- Vital Signs: Age-appropriate ranges critical
- Hypotension: <60mmHg (infant), <70mmHg (1mo-1yr), <90mmHg (>11yr)
- Assessment: Pediatric Assessment Triangle (Appearance/Work of Breathing/Circulation)

MEDICATIONS (Key Doses):
- Epinephrine: 1:10,000 = 0.1mg/mL (IV), 1:1,000 = 1mg/mL (IM)
- Naloxone: Titrate to respiratory effort, avoid full reversal
- Dextrose: D10 preferred, 5mL/kg for neonates
- Amiodarone: 150mg in 100mL over 10min
- Lidocaine: 1.5mg/kg IV for VF/VT or wide complex

PROVIDER LEVELS:
- CFR: BLS care, AED, Epinephrine for anaphylaxis
- EMT: Glucometry, assist with meds, CPAP, supraglottic airway
- AEMT: IV/IO, advanced medications, chest decompression
- Paramedic: Full ALS including RSI, needle decompression, all medications`
};

const CUSTOM_INSTRUCTIONS = `You are ClearChart and you create or improve EMS narratives that are clear, chronological, defensible, and compliant with the agency's uploaded protocols/policies/QA checklists.

CRITICAL RULES - NEVER VIOLATE:
- NO invented meds, times, or patient responses.
- DO NOT ask for vital signs - ever.
- DO NOT ask for blood glucose values - ever.
- DO NOT ask for specific times of vitals, interventions, dispatch, or response.
- You CAN ask about assessment findings, clinical observations, patient condition, and what was observed.
- If the user doesn't provide vital signs, blood glucose, or times, DO NOT ask for them - simply note in the narrative that they were not provided or write the narrative without them.
- Never make up vital signs, blood glucose, or assessment findings.
- Keep language plain, objective, active voice.
- Include pertinent negatives and preserve quotes.
- If policies conflict, ask which to follow.
- Receiving staff name and title is allowable in the narrative.

MODE TRIGGERS:
Builder Mode (start from scratch): build, create, write, fillable, step-by-step, start from scratch.
Improvement Mode (edit existing): improve, edit, review, QA check, revise, compliance, CMN, make better.
If unclear: ask which mode.

BUILDER MODE:
Intro: "We'll build this step-by-step. I'll ask a few questions at a time."
Ask 1–3 questions per section (but NEVER about vital signs or specific times):
1. Agency & call type - What type of call? What agency?
2. Dispatch & response - General dispatch info (not specific times)
3. Scene & patient overview - What did you find on scene? Chief complaint?
4. Assessment - What was observed? Patient's condition? (DO NOT ask for vitals/times)
5. Interventions - What treatments were provided? (DO NOT ask when)
6. Transport - How was transport conducted? Patient condition during transport?
7. Handoff - Who received the patient? Where?

Show partial narrative after each section.
End with full narrative + "Assumptions & Missing Data" if needed.
If vital signs or times weren't provided, note this in the narrative or omit gracefully.

IMPROVEMENT MODE – PHASE 1 (Clarification Only):
- Read the narrative and compare to agency protocols.
- Identify missing, unclear, or conflicting details.
- Output ONLY up to 5 targeted follow-up questions at a time.
- NEVER ask for vital signs or specific times - only ask about clinical observations, decisions, and circumstances.
- End with: "Answer these, then say 'ready for rewrite.'"
- Do not write or improve the narrative until the user says "ready for rewrite."

IMPROVEMENT MODE – PHASE 2 (Rewrite):
Only if the user says "ready for rewrite":
- Rewrite in chronological order, active voice, preserving facts and quotes.
- Include pertinent negatives and cite policies if relevant.
- Add QA Issues list or billing snippet if requested.
- Include Missing Data Note if applicable.
- Before writing the final narrative, ask the user if they would like it in paragraph, SOAP, or CHART format.
- At the end of every narrative generate an accurate statement of medical necessity of why the ambulance was required for transport.

KNOWLEDGE BASE USAGE:
The knowledge base contains NY State EMS Protocols and documentation standards. Use this ONLY as reference for:
- Protocol compliance when writing narratives
- Understanding proper documentation elements
- Ensuring medical accuracy
DO NOT use the knowledge base as a checklist of things to ask the user for. The knowledge base describes what SHOULD BE in a complete narrative, but you should work with whatever information the user provides.`;

export default function ClearChartChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to ClearChart. I can assist you in creating a narrative from scratch, improving your existing narrative, or generating you a medical need statement!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = `${CUSTOM_INSTRUCTIONS}

KNOWLEDGE BASE:

${KNOWLEDGE_BASE.emsDocumentation}

${KNOWLEDGE_BASE.protocolSummary}`;

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const response = await fetch(`${apiUrl}/api/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    const data = await response.json();
    const assistantMessage = {
      role: 'assistant',
      content: data.content[0].text
    };

    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, there was an error processing your request. Please try again.'
    }]);
  } finally {
    setLoading(false);
  }
};
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#C0BEBE' }}>
      {/* Header */}
      <div className="shadow-md border-b border-gray-300" style={{ backgroundColor: '#ECEEE1' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          {/* ResponderWorx Logo */}
          <img 
  src="/logo.png" 
  alt="ResponderWorx Logo"
  className="w-12 h-12"
/>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ClearChart</h1>
            <p className="text-xs text-gray-600">EMS Documentation Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#80A281' }}>
                <span className="text-2xl text-white">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ClearChart Documentation Assistant</h3>
              <p className="text-gray-600 text-sm">Create narratives, improve documentation, and generate medical need statements</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'text-gray-900'
                          : 'border border-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: msg.role === 'user' ? '#FAFAFA' : '#ECEEE1'
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                  
                  {/* Starter Buttons - Only show after first assistant message */}
                  {idx === 0 && messages.length === 1 && msg.role === 'assistant' && (
                    <div className="mt-6 flex flex-col gap-3 items-center">
                      <button
                        onClick={() => sendMessage('Build my narrative from scratch')}
                        className="w-full max-w-md px-6 py-4 rounded-xl font-medium text-white shadow-md hover:opacity-90 transition-all text-left"
                        style={{ backgroundColor: '#80A281' }}
                      >
                        <div className="text-base font-semibold">📝 Build my narrative from scratch</div>
                        <div className="text-sm opacity-90 mt-1">Start with a blank template</div>
                      </button>
                      
                      <button
                        onClick={() => sendMessage('Improve my narrative')}
                        className="w-full max-w-md px-6 py-4 rounded-xl font-medium text-white shadow-md hover:opacity-90 transition-all text-left"
                        style={{ backgroundColor: '#80A281' }}
                      >
                        <div className="text-base font-semibold">✨ Improve my narrative</div>
                        <div className="text-sm opacity-90 mt-1">Enhance existing documentation</div>
                      </button>
                      
                      <button
                        onClick={() => sendMessage('Generate a medical need statement')}
                        className="w-full max-w-md px-6 py-4 rounded-xl font-medium text-white shadow-md hover:opacity-90 transition-all text-left"
                        style={{ backgroundColor: '#80A281' }}
                      >
                        <div className="text-base font-semibold">🏥 Generate a medical need statement</div>
                        <div className="text-sm opacity-90 mt-1">Create billing documentation</div>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 shadow-sm border border-gray-200" style={{ backgroundColor: '#ECEEE1' }}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#80A281', animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#80A281', animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#80A281', animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t shadow-lg" style={{ backgroundColor: '#ECEEE1', borderColor: '#80A281' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or choose an option above..."
              className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 resize-none bg-white"
              style={{ borderColor: '#80A281', focusRingColor: '#80A281' }}
              rows="1"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-6 py-3 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              style={{ backgroundColor: '#80A281' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ClearChart by ResponderWorx • Powered by Claude AI • For informational purposes only
          </p>
        </div>
      </div>
    </div>
  );
}