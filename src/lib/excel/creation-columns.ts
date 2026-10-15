export const MAX_IMPORT_ROWS = 200;

export class ImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFileError";
  }
}

export type SheetColumn = {
  key: string;
  header: string;
  hint: string;
  example: string;
  width: number;
  required?: boolean;
};

export const creationColumns: SheetColumn[] = [
  { key: "title", header: "Title", hint: "Name shown on the creation page.", example: "Rooftop at Midnight", width: 28, required: true },
  { key: "slug", header: "Slug", hint: "Public address, such as rooftop-at-midnight. Leave blank to build it from the title.", example: "rooftop-at-midnight", width: 28 },
  { key: "shortDescription", header: "Short description", hint: "Text on the explore card. Publishing needs at least 10 characters.", example: "A rain-soaked rooftop above a midnight city.", width: 42, required: true },
  { key: "description", header: "Description", hint: "Opening text on the creation page. Publishing needs at least 10 characters.", example: "A cinematic still of a futuristic warrior overlooking a neon city in the rain.", width: 54 },
  { key: "mediaType", header: "Media type", hint: "IMAGE, VIDEO, IMAGE_SERIES, or TUTORIAL. Blank means IMAGE.", example: "IMAGE", width: 18 },
  { key: "status", header: "Status", hint: "DRAFT or PUBLISHED. Blank means DRAFT.", example: "DRAFT", width: 16 },
  { key: "prompt", header: "Prompt", hint: "The exact prompt shown in the prompt laboratory. Required to publish.", example: "A mysterious futuristic warrior standing on a rain-soaked rooftop at midnight.", width: 64, required: true },
  { key: "negativePrompt", header: "Negative prompt", hint: "What the generation should avoid.", example: "blurry armor, watermark, daylight", width: 36 },
  { key: "aspectRatio", header: "Aspect ratio", hint: "Shown with the generation settings.", example: "4:5", width: 16 },
  { key: "featured", header: "Featured", hint: "Yes or No. Featured creations can appear on the homepage.", example: "No", width: 14 },
  { key: "promptOfTheDay", header: "Prompt of the day", hint: "Yes or No. Only one creation keeps this. The last Yes in the file wins.", example: "No", width: 20 },
  { key: "seoTitle", header: "SEO title", hint: "Browser and social title. Blank uses the creation title.", example: "Rooftop at Midnight", width: 28 },
  { key: "seoDescription", header: "SEO description", hint: "Browser and social description. Blank uses the short description.", example: "A rain-soaked rooftop above a midnight city.", width: 42 },
  { key: "modelName", header: "Model", hint: "Model name shown beside the prompt.", example: "v6", width: 18 },
  { key: "platformName", header: "Platform", hint: "Platform name shown beside the prompt.", example: "Midjourney", width: 18 },
  { key: "seed", header: "Seed", hint: "Generation seed.", example: "184220", width: 16 },
  { key: "guidanceScale", header: "Guidance scale", hint: "Number from 0 to 100.", example: "5", width: 16 },
  { key: "stepCount", header: "Generation steps", hint: "Whole number from 1 to 500.", example: "30", width: 18 },
  { key: "resolution", header: "Resolution", hint: "Shown with the generation settings.", example: "1600x2000", width: 16 },
  { key: "durationSeconds", header: "Duration seconds", hint: "Video length in seconds.", example: "", width: 18 },
  { key: "frameRate", header: "Frame rate", hint: "Shown for motion work.", example: "", width: 14 },
  { key: "cameraMovement", header: "Camera movement", hint: "Shown for motion work.", example: "", width: 22 },
  { key: "motionInstructions", header: "Motion instructions", hint: "Shown in its own section when filled.", example: "", width: 36 },
  { key: "characterNotes", header: "Character notes", hint: "Shown as character consistency when filled.", example: "", width: 36 },
  { key: "workflowNotes", header: "Workflow notes", hint: "Shown in its own section when filled.", example: "Keep the wet surfaces and rim light from the first frame.", width: 42 },
  { key: "limitations", header: "Limitations", hint: "Shown in its own section when filled.", example: "", width: 32 },
  { key: "credits", header: "Credits", hint: "Shown in its own section when filled.", example: "", width: 28 },
  { key: "subscriptions", header: "Subscriptions", hint: "Shown as required subscriptions when filled.", example: "", width: 28 },
  { key: "extraSettings", header: "Extra settings", hint: "More settings, written as Label=Value; Label=Value.", example: "Stylize=250; Chaos=4", width: 32 },
  { key: "categories", header: "Categories", hint: "Comma-separated. A new name is created and published.", example: "Cinematic AI", width: 28, required: true },
  { key: "tags", header: "Tags", hint: "Comma-separated labels shown on the creation.", example: "rain, neon, night", width: 28 },
  { key: "tools", header: "Tools", hint: "Comma-separated tool names. A new name is added to the catalog.", example: "Midjourney", width: 24 },
  { key: "toolModels", header: "Tool models", hint: "Optional models in the same order as Tools.", example: "v6", width: 20 },
  { key: "coverFilename", header: "Cover filename", hint: "Exact file name already in the media library, including the extension.", example: "rooftop.png", width: 28 },
  { key: "coverAlt", header: "Cover alt text", hint: "Describe the cover. Required before publishing.", example: "Futuristic warrior on a rain-soaked rooftop", width: 42 },
];

export const stepColumns: SheetColumn[] = [
  { key: "creationKey", header: "Creation slug or title", hint: "Must match the Title or Slug on the Creations sheet.", example: "rooftop-at-midnight", width: 32, required: true },
  { key: "title", header: "Title", hint: "Step heading on the workflow timeline.", example: "Paste the prompt", width: 28, required: true },
  { key: "body", header: "Body", hint: "Step instructions.", example: "Copy the prompt exactly. Do not rewrite it before the first generation.", width: 64, required: true },
  { key: "tip", header: "Tip", hint: "Optional note shown with the step.", example: "Check the rim light before changing the subject.", width: 42 },
  { key: "warning", header: "Warning", hint: "Optional caution shown with the step.", example: "", width: 36 },
  { key: "link", header: "Link", hint: "Optional full URL shown with the step.", example: "", width: 36 },
];

export const mediaColumns: SheetColumn[] = [
  { key: "creationKey", header: "Creation slug or title", hint: "Must match the Title or Slug on the Creations sheet.", example: "rooftop-at-midnight", width: 32, required: true },
  { key: "filename", header: "Filename", hint: "Exact file name already in the media library, including the extension.", example: "rooftop-detail.png", width: 32, required: true },
  { key: "role", header: "Role", hint: "COVER, MAIN, GALLERY, REFERENCE, POSTER, SOURCE, or DOWNLOAD. Blank becomes GALLERY when a cover already exists.", example: "GALLERY", width: 16 },
  { key: "altText", header: "Alt text", hint: "Describe the file. Cover and main images need this before publishing.", example: "Close view of the wet rooftop edge", width: 42 },
];

const creationAliases: Record<string, string> = {
  modelname: "modelName",
  platformname: "platformName",
  stepcount: "stepCount",
  duration: "durationSeconds",
  generationsettings: "extraSettings",
  settings: "extraSettings",
  coverfile: "coverFilename",
  coverimage: "coverFilename",
  image: "coverFilename",
  imagefilename: "coverFilename",
  alt: "coverAlt",
  alttext: "coverAlt",
};

const stepAliases: Record<string, string> = {
  creation: "creationKey",
  slug: "creationKey",
  creationslug: "creationKey",
  creationtitle: "creationKey",
  externallink: "link",
  url: "link",
};

const mediaAliases: Record<string, string> = {
  creation: "creationKey",
  slug: "creationKey",
  creationslug: "creationKey",
  creationtitle: "creationKey",
  file: "filename",
  originalfilename: "filename",
  alt: "altText",
};

export function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function headerMap(columns: SheetColumn[], extras: Record<string, string>) {
  const map: Record<string, string> = { ...extras };
  for (const column of columns) map[normalizeHeader(column.header)] = column.key;
  return map;
}

export const creationHeaderMap = headerMap(creationColumns, creationAliases);
export const stepHeaderMap = headerMap(stepColumns, stepAliases);
export const mediaHeaderMap = headerMap(mediaColumns, mediaAliases);

export const templateInstructions = [
  "AI Creative Vault creation import",
  "Each row on the Creations sheet becomes one creation. Add as many rows as you need, up to 200 in one file.",
  "Keep row 1 as the headers. Do not rename those columns. Put the first creation on row 2.",
  "Cyan header text marks a field the public page expects when you publish. Draft rows can leave more cells empty.",
  "Leave Slug blank to build it from the title. On the other sheets, refer to a creation by that title or slug.",
  "Status blank means Draft. Drafts can omit the prompt, description, category, and image.",
  "Published rows need a prompt, a short description of at least 10 characters, a description, a category, and a cover or main image with alt text.",
  "Separate several categories, tags, or tools with commas. A category or tool name that does not exist yet is created.",
  "Tool models follow the same left-to-right order as Tools.",
  "Extra settings use Label=Value pairs separated by semicolons, for example Stylize=250; Chaos=4.",
  "Featured and Prompt of the day use Yes or No. If several rows say Yes for Prompt of the day, the last saved row keeps it.",
  "The Workflow steps sheet adds the timeline. One step per row, in the order they should appear.",
  "The Media sheet adds more files. The Filename must already be in the media library. Upload images there before importing.",
  "Cover filename on the Creations sheet is enough when a creation has one image. Use the Media sheet for galleries and downloads.",
  "The Example sheet is a sample only. It is not imported. Copy that row onto Creations when you want a starting point.",
  "The Allowed values sheet lists the accepted choices, plus the categories and tools already in the archive.",
];
