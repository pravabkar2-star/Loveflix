---
description: Create a love story video with scenes and image prompts
---
# Love Story Video Agent

This agent takes a story description from the user and creates a complete video configuration JSON, along with corresponding image prompts.

## Process
1. **Analyze Description**: Understand the story description provided by the user. The story will always use the **"Milk and Mocha Bears"** style.
   - **Milk**: the white bear (more expressive, affectionate).
   - **Mocha**: the brown bear (more chill, sometimes shy or grumpy).
2. **Generate Video Script (`.js`)**:
   - Create a single javascript configuration file for the video.
   - You MUST place it in a unique file in the `stories` directory (e.g., `stories/video_[timestamp].js`).
   - Keep each script in a **different file**.
   - Ensure the file name is unique and never overwrites an existing data file.
   - **Crucially**, do not just output raw JSON. You must assign the JSON object to `window.LF_STORIES["video_[timestamp]"]`. E.g., `window.LF_STORIES = window.LF_STORIES || {}; window.LF_STORIES["video_123"] = { ... };`.
   - The JSON data within the JS assignment should contain all the configuration for the structural storytelling of the video: frames with subtitles (`label`), durations, effects, transitions, etc. 
   - **Crucially, make sure you configure EVERYTHING except the actual image URLs.** (Leave the `image` fields as empty strings or placeholders, such as `""`).
   - **DO NOT GENERATE ANY IMAGES USING TOOLS**. Only generate the `.js` file and the prompt text files.
3. **Generate Image Prompts**:
   - For every scene/frame in the generated JSON, create a highly detailed image generation prompt.
   - Save these prompts in the `image_prompts/` directory.
   - Write the prompts to a `.txt` file inside `image_prompts/` associated with the video JSON named in Step 2.
   - **CRITICAL FORMATTING**: The contents of this file MUST be just the prompts separated by a newline (`\n`). Do not use numbers or bullet points.
   - **CRITICAL Consistency Rule**: *Every single image prompt* MUST explicitly describe "Milk (the white bear, more expressive, affectionate) and Mocha (the brown bear, more chill, sometimes shy or grumpy)" to guarantee character consistency.
4. **Make Available in Home**:
   - Ensure the newly created video is available at the top of `data/videos.js`. The `storyScript` should point to the `.js` file in `stories/` directory, and `storyKey` should match the key assigned in `window.LF_STORIES`. The top 5 videos will automatically appear in the preview top section.
