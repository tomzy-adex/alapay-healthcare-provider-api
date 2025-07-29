export enum UserRoles {
  HEALTHCARE_PROVIDER_ADMIN = 'healthcare-provider-admin',
  HEALTHCARE_CLAIM_OFFICER = 'healthcare-claim-officer',
  HEALTHCARE_FINANCE_OFFICER = 'healthcare-finance-officer',
  ALAPAY_ADMIN = 'alapay-admin',
}

export enum Status {
  ACTIVE = 'active',
  DORMANT = 'dormant',
  SUSPENDED = 'suspended',
}

export enum ProcessStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum OnboardingType {
  HEALTHCARE_CLAIM_OFFICER = 'claim-officer',
  HEALTHCARE_FINANCE_OFFICER = 'finance-officer',
  HEALTHCARE_PROVIDER_ADMIN = 'provider-admin',
  HEALTHCARE_PROVIDER = 'healthcare-provider',
}

export enum PaymentOptionType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  BI_WEEKLY = 'Bi-weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export enum PaymentDuration {
  DAILY = 1,
  WEEKLY = 7,
  BI_WEEKLY = 14,
  MONTHLY = 30,
  YEARLY = 365,
}

export enum ClaimType {
  OUT_OF_POCKET = 'out-of-pocket',
  PRE_AUTHORIZATION = 'pre-authorization',
}

export enum PaymentMethod {
  CARD = 'card',
  WALLET = 'wallet',
  NIP_TRANSFER = 'nip-transfer',
}

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export enum DependentType {
  SPOUSE = 'spouse',
  CHILD = 'child',
  PARENT = 'parent',
  OTHER = 'other',
}

export enum DownloadFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  // CSV = 'csv',
}

export enum ClaimPaymentStatus {
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  UNPAID = 'Unpaid',
}

export interface INotificationType {
  title: string;
  message: string;
}

export interface IAuditLog {
  /**
   * The action performed, e.g., CREATE, UPDATE, DELETE.
   */
  action: string;

  /**
   * The name of the entity affected, e.g., User, Order.
   */
  entityName: string;

  /**
   * The ID of the entity affected. Can be null for actions without a specific entity.
   */
  entityId: string | null;

  /**
   * The previous state of the entity. Can be null for CREATE or DELETE actions.
   */
  oldValue: Record<string, any> | null;

  /**
   * The new state of the entity. Can be null for DELETE actions.
   */
  newValue: Record<string, any> | null;

  /**
   * The ID of the user who performed the action. Can be null for system-initiated actions.
   */
  userId: string | null;
}

export interface IClaimPayment {
  claimId: string;
  amountExpected: number;
  amountPaid: number;
  paymentDate: Date;
  hmoName: string;
  status: ClaimPaymentStatus;
}

export interface IHmoClaimSummary {
  hmoName: string;
  totalClaims: number;
  totalPaid: number;
  outstandingBalance: number;
}
