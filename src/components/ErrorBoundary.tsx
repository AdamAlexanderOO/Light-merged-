import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050811] text-slate-200 p-6 font-sans select-none">
          <div className="max-w-xl w-full bg-[#0d1224] border border-red-500/40 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-8 h-8 shrink-0 text-red-400" />
              <div>
                <h1 className="text-lg font-mono font-bold tracking-wide text-red-300">
                  APPLICATION RECOVERY CONSOLE
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  A client execution issue was safely intercepted by the system
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/60 rounded border border-white/10 font-mono text-xs text-red-300 break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART STUDIO ENVIRONMENT</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
