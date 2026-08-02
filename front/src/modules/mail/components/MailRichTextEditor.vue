<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  minHeight?: number
}>(), {
  modelValue: "",
  label: "",
  minHeight: 220,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "update:text", value: string): void
  (e: "touched", value: boolean): void
}>()

const {t} = useI18n()
const editorRef = ref<HTMLElement | null>(null)
const savedSelection = ref<Range | null>(null)
const selectedFontFamily = ref("Sans Serif")
const selectedFontSize = ref("3")
const selectedTextColor = ref("#202124")
const inlineStyleMarker = "\u200B"
const fontFamilies = ["Sans Serif", "Serif", "Monospace", "Arial", "Verdana", "Tahoma", "Trebuchet MS", "Georgia"]
const fontSizes = [
  {title: t('mail.reply.format.small'), value: "2"},
  {title: t('mail.reply.format.normal'), value: "3"},
  {title: t('mail.reply.format.large'), value: "5"},
  {title: t('mail.reply.format.huge'), value: "7"},
]
const textColors = [
  "#202124",
  "#5f6368",
  "#d93025",
  "#f29900",
  "#188038",
  "#1967d2",
  "#9334e6",
]
const fontSizeStyles: Record<string, string> = {
  "2": "13px",
  "3": "16px",
  "5": "24px",
  "7": "32px",
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editorRef.value || editorRef.value.innerHTML === (value || "")) return
    nextTick(() => {
      if (editorRef.value) editorRef.value.innerHTML = value || ""
      emitText()
    })
  },
  {immediate: true}
)

onMounted(() => {
  document.addEventListener("selectionchange", saveEditorSelection)
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || ""
    emitText()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener("selectionchange", saveEditorSelection)
})

function focusEditor() {
  editorRef.value?.focus()
}

defineExpose({
  focusEditor,
})

function saveEditorSelection() {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !editorRef.value) return

  const range = selection.getRangeAt(0)
  const {commonAncestorContainer} = range
  const selectedNode = commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? commonAncestorContainer.parentNode
    : commonAncestorContainer

  if (selectedNode && editorRef.value.contains(selectedNode)) {
    savedSelection.value = range.cloneRange()
  }
}

function restoreEditorSelection() {
  if (!savedSelection.value) return

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(savedSelection.value)
}

function updateBodyFromEditor() {
  if (!editorRef.value) return
  const html = sanitizeHtml(editorRef.value.innerHTML)
  emit("update:modelValue", html)
  emitText()
  emit("touched", true)
  saveEditorSelection()
}

function emitText() {
  emit("update:text", editorRef.value?.innerText.replaceAll(inlineStyleMarker, "").trim() || "")
}

function applyFormat(command: string, value?: string) {
  focusEditor()
  restoreEditorSelection()
  document.execCommand(command, false, value)
  updateBodyFromEditor()
}

function applyFontFamily(value: string) {
  selectedFontFamily.value = value
  applyInlineStyle("fontName", value, {"font-family": value})
}

function applyFontSize(value: string) {
  selectedFontSize.value = value
  applyInlineStyle("fontSize", value, {"font-size": fontSizeStyles[value] || fontSizeStyles["3"]})
}

function applyTextColor(value: string) {
  selectedTextColor.value = value
  applyInlineStyle("foreColor", value, {color: value})
}

function applyInlineStyle(command: string, value: string, styles: Record<string, string>) {
  focusEditor()
  restoreEditorSelection()

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (range?.collapsed) {
    insertInlineStyleMarker(range, styles)
    updateBodyFromEditor()
    return
  }

  document.execCommand(command, false, value)
  updateBodyFromEditor()
}

function insertInlineStyleMarker(range: Range, styles: Record<string, string>) {
  const span = document.createElement("span")
  Object.entries(styles).forEach(([property, value]) => {
    span.style.setProperty(property, value)
  })

  const marker = document.createTextNode(inlineStyleMarker)
  span.appendChild(marker)
  range.deleteContents()
  range.insertNode(span)
  range.setStart(marker, marker.length)
  range.collapse(true)

  restoreRange(range)
}

function applyQuote() {
  focusEditor()
  restoreEditorSelection()

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (!range) return

  const quote = findClosestQuote(range)
  if (quote) {
    exitQuote(quote)
    updateBodyFromEditor()
    return
  }

  if (range.collapsed) {
    insertQuoteBlock(range)
  } else {
    wrapSelectionWithQuote(range)
  }

  updateBodyFromEditor()
}

function findClosestQuote(range: Range) {
  const node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer as Element | null
  const quote = node?.closest("blockquote")
  return quote && editorRef.value?.contains(quote) ? quote as HTMLQuoteElement : null
}

function exitQuote(quote: HTMLQuoteElement) {
  const normalLine = document.createElement("div")
  normalLine.appendChild(document.createElement("br"))
  quote.after(normalLine)
  if (isQuoteEmpty(quote)) {
    quote.remove()
  }

  const nextRange = document.createRange()
  nextRange.setStart(normalLine, 0)
  nextRange.collapse(true)
  restoreRange(nextRange)
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey) return

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (!range?.collapsed) return

  const quote = findClosestQuote(range)
  if (!quote || !isRangeAtQuoteEnd(range, quote)) return

  event.preventDefault()
  exitQuote(quote)
  updateBodyFromEditor()
}

function isRangeAtQuoteEnd(range: Range, quote: HTMLQuoteElement) {
  const afterCursor = document.createRange()
  afterCursor.selectNodeContents(quote)
  afterCursor.setStart(range.endContainer, range.endOffset)
  return !afterCursor.toString().trim()
}

function isQuoteEmpty(quote: HTMLQuoteElement) {
  return !quote.textContent?.replaceAll(inlineStyleMarker, "").trim()
}

function insertQuoteBlock(range: Range) {
  const quote = createQuoteElement()
  quote.appendChild(document.createElement("br"))
  range.deleteContents()
  range.insertNode(quote)

  const nextRange = document.createRange()
  nextRange.setStart(quote, 0)
  nextRange.collapse(true)
  restoreRange(nextRange)
}

function wrapSelectionWithQuote(range: Range) {
  const quote = createQuoteElement()
  quote.appendChild(range.extractContents())
  range.insertNode(quote)

  const nextRange = document.createRange()
  nextRange.selectNodeContents(quote)
  nextRange.collapse(false)
  restoreRange(nextRange)
}

function createQuoteElement() {
  const quote = document.createElement("blockquote")
  quote.style.borderLeft = "4px solid #dadce0"
  quote.style.color = "#5f6368"
  quote.style.margin = "8px 0"
  quote.style.padding = "4px 0 4px 12px"
  return quote
}

function restoreRange(range: Range) {
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  savedSelection.value = range.cloneRange()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function insertPlainTextFallback(value: string) {
  applyFormat("insertHTML", escapeHtml(value).replace(/\n/g, "<br>"))
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const html = event.clipboardData?.getData("text/html")
  const text = event.clipboardData?.getData("text/plain") || ""
  if (html) {
    applyFormat("insertHTML", sanitizeHtml(html))
    return
  }
  insertPlainTextFallback(text)
}

function sanitizeHtml(value: string) {
  if (!value.trim()) return ""

  const template = document.createElement("template")
  template.innerHTML = value
  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "div",
    "em",
    "font",
    "i",
    "li",
    "ol",
    "p",
    "s",
    "span",
    "strike",
    "strong",
    "u",
    "ul",
  ])

  cleanNode(template.content)
  removeInlineStyleMarkers(template.content)
  template.content.querySelectorAll("*").forEach((node) => {
    const element = node as HTMLElement
    if (!allowedTags.has(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    cleanAttributes(element)
  })

  return template.innerHTML.trim()
}

function cleanNode(node: ParentNode) {
  node.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((element) => element.remove())
}

function removeInlineStyleMarkers(node: ParentNode) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((textNode) => {
    textNode.nodeValue = textNode.nodeValue?.replaceAll(inlineStyleMarker, "") || ""
  })
}

function cleanAttributes(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value
    const isAnchorHref = tagName === "a" && name === "href" && /^(https?:|mailto:)/i.test(value)
    const isFontAttribute = tagName === "font" && ["color", "face", "size"].includes(name)
    const isStyle = name === "style"

    if (!isAnchorHref && !isFontAttribute && !isStyle) {
      element.removeAttribute(attribute.name)
    }
  })

  sanitizeStyleAttribute(element)
}

function sanitizeStyleAttribute(element: HTMLElement) {
  const allowedStyles = ["border-left", "border-inline-start", "color", "background-color", "font-family", "font-size", "margin", "padding", "text-align"]
  const nextStyles = allowedStyles
    .map((property) => {
      const value = element.style.getPropertyValue(property)
      return value ? `${property}: ${value}` : ""
    })
    .filter(Boolean)

  if (nextStyles.length) {
    element.setAttribute("style", nextStyles.join("; "))
  } else {
    element.removeAttribute("style")
  }
}
</script>

<template>
  <v-sheet border rounded class="mail-editor">
    <div
      class="d-flex align-center flex-wrap ga-1 pa-2 bg-grey-lighten-5"
      @mousedown.capture="saveEditorSelection"
    >
      <v-btn icon="mdi-undo" variant="text" size="small" :title="t('mail.reply.format.undo')" @click="applyFormat('undo')" />
      <v-btn icon="mdi-redo" variant="text" size="small" :title="t('mail.reply.format.redo')" @click="applyFormat('redo')" />

      <v-divider vertical class="mx-1 align-self-stretch" />

      <v-select
        v-model="selectedFontFamily"
        :items="fontFamilies"
        density="compact"
        variant="plain"
        hide-details
        class="mail-editor__font"
        :title="t('mail.reply.format.fontFamily')"
        @update:model-value="applyFontFamily"
      />

      <v-select
        v-model="selectedFontSize"
        :items="fontSizes"
        density="compact"
        variant="plain"
        hide-details
        class="mail-editor__size"
        :title="t('mail.reply.format.fontSize')"
        @update:model-value="applyFontSize"
      />

      <v-divider vertical class="mx-1 align-self-stretch" />

      <v-btn icon="mdi-format-bold" variant="text" size="small" :title="t('mail.reply.format.bold')" @click="applyFormat('bold')" />
      <v-btn icon="mdi-format-italic" variant="text" size="small" :title="t('mail.reply.format.italic')" @click="applyFormat('italic')" />
      <v-btn icon="mdi-format-underline" variant="text" size="small" :title="t('mail.reply.format.underline')" @click="applyFormat('underline')" />

      <v-menu :close-on-content-click="false">
        <template #activator="{props: menuProps}">
          <v-btn
            v-bind="menuProps"
            icon="mdi-format-color-text"
            variant="text"
            size="small"
            :title="t('mail.reply.format.textColor')"
          />
        </template>
        <v-card class="pa-2" width="196">
          <div class="d-flex flex-wrap ga-1">
            <v-btn
              v-for="color in textColors"
              :key="color"
              icon
              size="small"
              variant="text"
              :title="color"
              @click="applyTextColor(color)"
            >
              <v-avatar :color="color" size="20" />
            </v-btn>
          </div>
        </v-card>
      </v-menu>

      <v-divider vertical class="mx-1 align-self-stretch" />

      <v-btn icon="mdi-format-align-left" variant="text" size="small" :title="t('mail.reply.format.alignLeft')" @click="applyFormat('justifyLeft')" />
      <v-btn icon="mdi-format-align-center" variant="text" size="small" :title="t('mail.reply.format.alignCenter')" @click="applyFormat('justifyCenter')" />
      <v-btn icon="mdi-format-align-right" variant="text" size="small" :title="t('mail.reply.format.alignRight')" @click="applyFormat('justifyRight')" />
      <v-btn icon="mdi-format-list-numbered" variant="text" size="small" :title="t('mail.reply.format.numberedList')" @click="applyFormat('insertOrderedList')" />
      <v-btn icon="mdi-format-list-bulleted" variant="text" size="small" :title="t('mail.reply.format.bulletedList')" @click="applyFormat('insertUnorderedList')" />
      <v-btn icon="mdi-format-indent-decrease" variant="text" size="small" :title="t('mail.reply.format.outdent')" @click="applyFormat('outdent')" />
      <v-btn icon="mdi-format-indent-increase" variant="text" size="small" :title="t('mail.reply.format.indent')" @click="applyFormat('indent')" />
      <v-btn icon="mdi-format-quote-close" variant="text" size="small" :title="t('mail.reply.format.quote')" @click="applyQuote" />
      <v-btn icon="mdi-format-strikethrough" variant="text" size="small" :title="t('mail.reply.format.strikeThrough')" @click="applyFormat('strikeThrough')" />

      <v-divider vertical class="mx-1 align-self-stretch" />

      <v-btn icon="mdi-format-clear" variant="text" size="small" :title="t('mail.reply.format.clear')" @click="applyFormat('removeFormat')" />
    </div>

    <v-divider />

    <div
      ref="editorRef"
      class="mail-editor__body"
      contenteditable="true"
      role="textbox"
      :aria-label="label || t('mail.reply.message')"
      :style="{minHeight: `${minHeight}px`}"
      @input="updateBodyFromEditor"
      @blur="updateBodyFromEditor"
      @keydown="onEditorKeydown"
      @paste="onPaste"
    />
  </v-sheet>
</template>

<style scoped>
.mail-editor {
  overflow: hidden;
}

.mail-editor__font {
  max-width: 142px;
  min-width: 124px;
}

.mail-editor__size {
  max-width: 96px;
  min-width: 84px;
}

.mail-editor__body {
  outline: none;
  padding: 16px;
  white-space: normal;
}

.mail-editor__body:focus {
  box-shadow: inset 0 0 0 2px rgb(var(--v-theme-primary));
}

.mail-editor__body:empty::before {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  content: attr(aria-label);
  pointer-events: none;
}

.mail-editor__body :deep(ul),
.mail-editor__body :deep(ol) {
  margin-block: 8px;
  padding-inline-start: 28px;
}

.mail-editor__body :deep(li) {
  padding-inline-start: 4px;
}

.mail-editor__body :deep(blockquote) {
  border-inline-start: 4px solid rgba(var(--v-theme-on-surface), 0.28);
  color: rgba(var(--v-theme-on-surface), 0.72);
  margin: 8px 0;
  padding: 4px 0 4px 12px;
}
</style>
