export type ActionDataWithValidationErrors<T> = {
    error?: string;
    formValidationErrors?: FormValidationErrors<T>;
};
export type FormValidationErrors<T> = {
    [K in keyof T]?: string[];
};
