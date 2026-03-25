export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number = 400) {
        super(message);
        this.status = status;
    }
}

export function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return Response.json(
            { error: error.message },
            { status: error.status },
        );
    }
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
}
