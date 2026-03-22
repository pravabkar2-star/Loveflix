---
description: Create a love story video with scenes and image prompts
---
# Love Story Video Agent

This agent takes a story description from the user and creates a complete video configuration JSON, along with corresponding image prompts.

## Process
1. **Analyze Description**: Understand the story description provided by the user. The story will always use the **"Milk and Mocha Bears"** style.
   - **Milk**: the white bear (more expressive, affectionate).
   - **Mocha**: the brown bear (more chill, sometimes shy or grumpy).
2. **Generate Video JSON**:
   - Create a single JSON configuration for the video.
   - You MUST place it in a unique file (e.g., `data/video_[timestamp].json`).
   - Keep each video JSON in a **different file**.
   - Ensure the JSON file name is unique and never overwrites an existing data file.
   - The JSON should contain all the configuration for the structural storytelling of the video: frames with subtitles (`label`), durations, effects, transitions, etc. 
   - **Crucially, make sure you configure EVERYTHING except the actual image URLs.** (Leave the `image` fields as empty strings or placeholders, such as `""`).
   - **DO NOT GENERATE ANY IMAGES USING TOOLS**. Only generate the JSON and the prompt text files.
3. **Generate Image Prompts**:
   - For every scene/frame in the generated JSON, create a highly detailed image generation prompt.
   - Save these prompts in the `image_prompts/` directory.
   - Write the prompts to a `.txt` or `.md` file inside `image_prompts/` associated with the video JSON named in Step 2.
   - **CRITICAL Consistency Rule**: *Every single image prompt* MUST explicitly describe "Milk (the white bear, more expressive, affectionate) and Mocha (the brown bear, more chill, sometimes shy or grumpy)" to guarantee character consistency.
4. **Make Available in Home**:
   - Ensure the newly created video JSON is available at the top of `home.html` by adding a corresponding entry to the very top of the `window.LF_VIDEOS` array in `data/videos.js` (or similar registration file) so it appears first on the home screen.
