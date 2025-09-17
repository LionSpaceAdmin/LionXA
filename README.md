# Autonomous AI Agent with Firebase and Google Cloud

This project implements an autonomous agent that leverages Firebase (Firestore/Storage) and Google Cloud AI services to process user requests, enrich responses with semantic context, and analyze images.

## Core Functionality

The agent's primary goal is to respond to user prompts submitted via Firestore, enhance those responses with semantically relevant information from a knowledge base, and analyze images from Cloud Storage. All processes are designed to be automated and bidirectional with Firestore.

---

## Data Sources and Configuration

### Firestore Collections

-   **`generate`**: The main input collection for user requests.
    -   **Fields**:
        -   `prompt` (string, required): The user's text request.
        -   `image` (string, optional): A `gs://` or public URL to an image for analysis.
        -   `output` (map): The field where the agent writes its structured response.

-   **`documents`**: A knowledge base for semantic search.
    -   **Fields**:
        -   `content` (string): The text content of the document.
        -   The semantic search extension will automatically add and manage an `embeddings` field.

-   **`vision`**: (Optional) A centralized collection for storing visual analysis results.
    -   **Fields**: Defined in the "Image Analysis" section below.

### Cloud Storage Buckets

-   **Default Firebase Bucket (`<project-id>.appspot.com`)**: Used for storing new images that require analysis by the Cloud Vision API.

---

## Triggers and Required Behavior

### A) Text/Multimodal Generation (Firestore → Gemini → Firestore)

This flow is triggered when a document is created or updated in the `generate` collection.

1.  **Trigger**: A document in the `generate` collection has a `prompt` field.
2.  **Semantic Search**: The agent performs a semantic search against the `content` field in the `documents` collection to find up to 5 relevant context snippets.
3.  **Model Selection**:
    -   If an `image` URL is provided in the document, the agent uses the **`gemini-pro-vision`** model for multimodal analysis.
    -   Otherwise, the agent uses the **`gemini-pro`** model for text-only generation.
4.  **Output Generation**: The agent writes a structured response to the `output` field of the triggering document in the following format:

    ```json
    {
      "answer": "...",
      "context_snippets": [],
      "document_ids": [],
      "reasoning_brief": "...",
      "safety_flags": {
        "hallucination_check": "pass|warn",
        "pii_check": "pass|warn"
      }
    }
    ```
    -   **answer**: A concise response in Hebrew, using bullet points where appropriate.
    -   **context_snippets**: Up to 5 relevant snippets (max 280 characters each) from the semantic search.
    -   **document_ids**: The Firestore document IDs corresponding to the context snippets.
    -   **reasoning_brief**: A short, 1-3 line explanation of how the answer was derived.
    -   **safety_flags**: Basic checks for potential hallucinations or PII. Marked as `warn` if there is any uncertainty.

### B) Semantic Search (Continuous Background Management)

This flow ensures the knowledge base is always ready for semantic queries.

1.  **Trigger**: A new document is created or an existing one is updated in the `documents` collection.
2.  **Action**: The system automatically calculates the embedding for the `content` field using the **`textembedding-gecko@001`** model (via the Vertex AI Semantic Search extension). This embedding is stored according to the extension's schema, enabling similarity queries.

### C) Image Analysis (Storage → Vision → Firestore)

This flow is triggered when a new image is uploaded to the default Cloud Storage bucket.

1.  **Trigger**: A new image file is uploaded to Cloud Storage.
2.  **AI Vision Analysis**: The agent runs two Cloud Vision AI tasks:
    -   **Label Detection**: To get general classifications of the image content.
    -   **Object Detection**: To identify specific objects and their bounding boxes.
3.  **Store Results**: The results are written to a document in the `vision` collection (or a related logical document) in the following format:

    ```json
    {
      "filePath": "gs://...",
      "labels": [{ "description": "...", "score": 0.95 }],
      "objects": [{ "name": "...", "score": 0.88, "box": [0.1, 0.2, 0.8, 0.9] }],
      "ts": "..."
    }
    ```

---

## General Rules and Guidelines

-   **Privacy & Safety**: No hardcoded keys. No generation of personal information. Flag potential issues with `warn`.
-   **Consistency**: Adhere strictly to the defined Firestore schemas to maintain compatibility with extensions and other services.
-   **Localization**: All user-facing answers (`answer` field) should be in clear, concise Hebrew.
-   **Resilience**: In case of API failures or permission errors, the agent should return an `output` with a descriptive error message in the `answer` field and set `safety_flags` appropriately.
-   **Performance**: Optimize for single-candidate responses from the Gemini API, use a moderate temperature, and limit answer length to ~1200 characters.
-   **Attribution**: When context from the `documents` collection is used, the `document_ids` field must be populated for traceability.
