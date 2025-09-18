export interface IReport {
    date: number,
    user?: string,
    error: {
        name: string,
        message: string,
        stack?: string
    }
}