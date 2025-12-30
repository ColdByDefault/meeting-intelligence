---
applyTo: '**'
---

### **The Use-Case: "Auto-Meeting Intelligence"**

**The Problem:**
Consultants, coaches, and agency owners spend hours on Zoom. After the call, they have to manually listen to the recording, type up notes, find the "action items" (what they promised to do), and put them into their project management tool (Notion). It is tedious, unbillable work.

**The Solution:**
A secure, private web portal. The client uploads an audio file (mp3/m4a). The system processes it in the background and—within 60 seconds—creates a new page in their Notion workspace containing:

1. A short **Executive Summary** (What was the meeting about?).
2. A bulleted list of **Action Items** (Who needs to do what?).
3. The **Sentiment** (Did the client sound happy or angry?).

**Why this sells:**
You aren't selling "file upload functionality." You are selling **"saving 30 minutes of admin work per client call."**

---

### **The Implementation Plan**

#### **Phase 1: The "Invisible Brain" (n8n Workflow)**

*Always build the backend logic first so you have a URL to test against.*

**Goal:** Create a webhook that accepts a file, processes it, and sends it to Notion.

1. **Trigger: Webhook Node**
* Set method to `POST`.
* Authentication: `None` (for now) or `Header Auth` (secure).
* **Crucial:** This gives you the URL you will need for your Next.js app (e.g., `https://n8n.your-domain.com/webhook/meeting-processor`).


2. **Step 1: OpenAI Node (Whisper)**
* **Action:** Audio -> Transcription.
* **Input:** The binary data from the Webhook.
* **Output:** Returns raw text string.


3. **Step 2: AI Agent / LLM Node (The Analysis)**
* **Model:** Dynamic (multiple choices) + option to add own API secret key:  GPT-4o-mini (cheap and fast) or Claude 3.5 Haiku.
* **System Prompt:**
> "You are an executive assistant. Analyze the following meeting transcript. Extract: 1) A 3-sentence summary. 2) A checklist of action items. 3) The overall sentiment. Return the result in JSON format."




4. **Step 3: Notion Node**
* **Credential:** Connect your Notion integration.
* **Action:** Create a Page.
* **Parent Page:** Select a specific database (e.g., "Meeting Notes").
* **Content:** Map the JSON output from the AI node into the Notion page blocks.


5. **Final Step: Respond to Webhook Node**
* Send a JSON response back to the frontend: `{ "status": "success", "message": "Notion page created!" }`.



---

### **Phase 2: The "Professional Face" (Next.js Frontend)**

*This is what creates the "App Experience" rather than just a script.*

**Goal:** A clean UI where users drop a file and see the status.

1. **Setup:**
* Create a new page in your portfolio (e.g., `/demos/meeting-analyser`).
* Use a UI library (like ShadCN UI) for a professional look.


2. **The UI Components:**
* **File Input:** Use a drag-and-drop zone (e.g., `react-dropzone`). Limit file types to `.mp3`, `.wav`, `.m4a`.
* **Status Indicators:** A simple stepper:
* ⚪ Uploading...
* ⚪ Processing Audio...
* ⚪ Generating Notes...
* 🟢 Done! Check Notion.




3. **The Logic (Client Component):**
* On file selection, create a `FormData` object.
* Append the file: `formData.append('file', file)`.
* `fetch('YOUR_N8N_WEBHOOK_URL', { method: 'POST', body: formData })`.


4. **Error Handling:**
* If n8n returns an error (or times out), show a friendly message: "Our AI brain is busy. Please try again."



---

### **Phase 3: The "Business" Polish (How to Demo it)**

*Don't just leave it as a blank form.*

1. **Pre-fill the Magic:**
* Since visitors won't have their *own* Notion connected to your n8n, you have two options:
* **Option A (Easier):** The success message should say: *"Success! This has been sent to Yazan's public demo Notion page. [Click here to view the result]."*
* **Option B (Advanced):** Display the summary directly on the Next.js page in a nice card *in addition* to sending it to Notion.




2. **Add a "Fake" Toggle:**
* Add a toggle switch: "Send to CRM" or "Email Summary to Attendees."
* Even if you don't build these, adding the UI shows clients that the system is *extensible*.



---

### **Summary of Tasks for You**

1. **Tonight:** Open your self-hosted n8n (or cloud). Build the flow: `Webhook -> OpenAI Whisper -> OpenAI Chat -> Notion`. Test it with a voice memo from your phone.
2. **Tomorrow:** Build the simple Next.js upload form. Connect it to the Webhook.
3. **Launch:** Add a "Case Study" card to your portfolio:
* **Title:** "Automated Meeting Workflows"
* **Headline:** "From Voice Memo to Notion in 30 Seconds."
* **Tech:** Next.js, n8n, OpenAI.



Do you want me to write the **n8n System Prompt** for the AI node so it extracts exactly what you need?