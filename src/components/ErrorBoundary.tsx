
import React from "react";
import { trackRenderError } from "@/lib/dashboard-intelligence";

export function withErrorBoundary<T>(Component: React.ComponentType<T>, componentName: string) {
  return class ErrorBoundary extends React.Component<T, { hasError: boolean }> {
    constructor(props: T) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      trackRenderError(componentName, error);
    }

    componentDidMount() {
      // Listen for reload events for this component
      window.addEventListener('dashboard:reload-component', this.handleReloadEvent);
    }
    
    componentWillUnmount() {
      window.removeEventListener('dashboard:reload-component', this.handleReloadEvent);
    }
    
    handleReloadEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.component === componentName) {
        this.setState({ hasError: false });
      }
    }

    render() {
      if (this.state.hasError) {
        // Fallback UI
        return (
          <div className="p-4 bg-destructive/10 rounded-md">
            <h3 className="font-medium text-destructive">Something went wrong in {componentName}</h3>
            <button 
              className="mt-2 text-sm text-primary underline"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}
