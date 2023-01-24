export class AppError extends Error {
  public readonly status: number;

  constructor(error: any, status?: number) {
    // Prep args
    let messageArg;
    let statusArg = typeof status === "number" ? status : 500;

    if (typeof error === "string") {
      messageArg = error;
    } else if (error instanceof Error) {
      messageArg = error.message;
      if (error instanceof AppError) {
        statusArg = error.status;
      }
    } else {
      messageArg = JSON.stringify(error);
    }
    super(messageArg);

    this.status = statusArg;
  }
}
export class DatabaseError extends AppError {}
export class ValidationError extends AppError {
  status = 422;
}
export class AccessDeniedError extends AppError {
  status = 403;
}
