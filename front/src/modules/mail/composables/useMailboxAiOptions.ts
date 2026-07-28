import type {IMailbox, IMailboxPriorityOption, IMailboxSentimentOption} from "@/modules/mail/interfaces/IMailbox";

type MailboxOption = string | {name: string};

function optionName(option?: MailboxOption | null): string {
  if (!option) return "";
  return typeof option === "string" ? option : option.name;
}

function optionNames(options?: MailboxOption[]): string[] {
  return (options || []).map(optionName).filter(Boolean);
}

function findOption<T extends MailboxOption>(options: T[] | undefined, name?: string | null): T | null {
  if (!name) return null;
  return (options || []).find((option) => optionName(option) === name) || null;
}

function sentimentOption(mailbox?: IMailbox | null, name?: string | null): IMailboxSentimentOption | string | null {
  return findOption(mailbox?.sentiments, name);
}

function priorityOption(mailbox?: IMailbox | null, name?: string | null): IMailboxPriorityOption | string | null {
  return findOption(mailbox?.priorities, name);
}

function sentimentEmoji(mailbox?: IMailbox | null, name?: string | null): string {
  const option = sentimentOption(mailbox, name);
  if (!option || typeof option === "string") return "";
  return option.emoji || "";
}

function priorityIcon(mailbox?: IMailbox | null, name?: string | null): string {
  const option = priorityOption(mailbox, name);
  if (!option || typeof option === "string") return "";
  return option.icon || "";
}

function priorityColor(mailbox?: IMailbox | null, name?: string | null): string | undefined {
  const option = priorityOption(mailbox, name);
  if (!option || typeof option === "string") return undefined;
  return option.color || undefined;
}

export function useMailboxAiOptions() {
  return {
    optionName,
    optionNames,
    sentimentOption,
    priorityOption,
    sentimentEmoji,
    priorityIcon,
    priorityColor,
  };
}
