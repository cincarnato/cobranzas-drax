type SessionEmailStatus = "ACTIVE" | "PAUSED" | "CLOSED"

interface ISessionEmailBase {
  mailbox: any
  user: any
  status: SessionEmailStatus
  startedAt: Date | string
  pausedAt?: Date | string | null
  endedAt?: Date | string | null
  lastActivityAt?: Date | string | null
  maxAssignableEmails: number
  assignedCount: number
  repliedCount: number
  closedCount: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface ISessionEmail extends ISessionEmailBase {
  _id: string
}

type SessionEmailState = {
  session: ISessionEmail | null
  maxAssignableEmails: number
  currentAssignedCount: number
  assignedEmails?: any[]
}

export type {
  ISessionEmail,
  ISessionEmailBase,
  SessionEmailState,
  SessionEmailStatus,
}
