export interface IScheduleJobHandler {
  /**
   * - `payload` từ DB
   * - `meta`: bạn có thể truyền thêm context (e.g. correlationId)
   */
  execute(payload: any, meta?: Record<string, any>): Promise<void>;

  /** Nếu cần cleanup / onCancel */
  cancel?(payload: any): Promise<void>;
}
