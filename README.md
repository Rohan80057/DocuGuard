# DocuGuard

*An intelligent system to detect and resolve contradictions in your documents.*

DocuGuard is a powerful web application designed to help individuals and organizations maintain consistency across their important documents. By leveraging the power of Google's Gemini AI, it automatically analyzes multiple text files, identifies conflicting information, and presents it in a clear, manageable interface.

<!-- Replace with a real screenshot of your app's dashboard or conflict inbox -->

---

## ✨ Core Features

-   *AI-Powered Contradiction Detection*: Upload multiple .txt documents and let the advanced AI find subtle and obvious inconsistencies in percentages, dates, durations, opposing terms, and more.
-   *Detailed Conflict Analysis*: For every conflict found, DocuGuard provides a clear explanation, a severity rating (High, Medium, Low), and the exact conflicting text excerpts from each document.
-   *Intuitive Conflict Inbox*: Manage all identified issues in a clean, professional table view. Filter by severity or resolution status, and sort the results to prioritize your work.
-   *Interactive Document Graph*: Visualize the relationships between your documents. This graph view shows which documents are connected by conflicts, with interactive highlighting and conflict counts to help you understand the big picture.
-   *Streamlined Resolution*: Resolve conflicts directly within the app using a side-by-side modal that displays the conflicting excerpts, allowing you to make informed decisions.
-   *Built-in Document Editor*: View and make changes to your documents without leaving the application. Includes a convenient document switcher to easily navigate between your files.
-   *Comprehensive Action History*: Keep track of all major actions with a timestamped log, including when analyses were started and when conflicts were resolved.
-   *Exportable Reports*: Generate and download detailed .txt reports of the conflicts for offline use, sharing, or record-keeping.
-   *Persistent Sessions*: Your documents, conflicts, and history are automatically saved in your browser's local storage, so you can pick up right where you left off.
-   *Sleek Dark UI*: A modern, dark-themed interface that's easy on the eyes and helps you focus on your work.

---

## 🛠 Technology Stack

-   *Frontend*: React, TypeScript, Tailwind CSS
-   *AI / Language Model*: Google Gemini API

---

## 🚀 Getting Started

Follow these instructions to get a local copy of DocuGuard up and running.

### Prerequisites

-   Node.js and npm (or yarn) installed on your machine.
-   A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  *Clone the repository:*
    bash
    git clone https://github.com/your-username/docuguard.git
    cd docuguard
    

2.  *Install dependencies:*
    bash
    npm install
    

3.  *Set up your API Key:*
    The application is configured to use an environment variable for the Gemini API key. You will need to ensure this is available in your local environment. The specific method may vary depending on your setup (e.g., using a .env file with a tool like Vite or Create React App, or setting it system-wide).

    Create a .env file in the root of the project and add your API key:
    
    API_KEY=YOUR_GEMINI_API_KEY
    
    _*Note:* The application code specifically looks for process.env.API_KEY. Ensure your build tool is configured to expose environment variables to your client-side code._

4.  *Run the application:*
    bash
    npm start
    
    This will start the development server. Open your browser and navigate to the local address provided (usually http://localhost:3000).

---

## USAGE

1.  *Upload Documents: On the **Dashboard*, drag and drop or click to upload two or more .txt files.
2.  *Start Analysis: Once you have selected your files, click the **"Analyze Documents"* button. The AI will begin processing them.
3.  *Review Conflicts: You will be automatically taken to the **Conflict Inbox*. Here you can see a list of all detected contradictions. Use the filters to narrow down the results.
4.  *Resolve Conflicts: Click the **"Resolve"* button on any conflict to open a modal. It will show you the conflicting text side-by-side, allowing you to resolve or ignore it.
5.  *Visualize Relationships: Navigate to the **Conflict Graph* to see a visual map of how your documents and their conflicts are interconnected.
