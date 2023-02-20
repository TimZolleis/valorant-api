import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    component: React.ReactNode;
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to an error reporting service
    }

    render() {
        const { hasError } = this.state;
        const { component } = this.props;

        if (hasError) {
            return <div>Something went wrong.</div>; // or you can render a custom error component
        }

        return component;
    }
}
