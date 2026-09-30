import { auth, db } from './firebase/config';

function App() {
  const isFirebaseReady = Boolean(auth && db);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="rounded-xl bg-slate-800 p-8 shadow-2xl border border-slate-700 text-center max-w-md w-full space-y-4">
        <h1 className="text-4xl font-extrabold text-indigo-400">
          ClassConnect
        </h1>
        <p className="text-slate-300 font-medium text-sm">
          Students Helping Students
        </p>

        <div className="pt-2 border-t border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 bg-slate-900/50 rounded-lg">
            <span className="text-slate-400">Task 1: Core Setup</span>
            <span className="text-emerald-400">✓ Active</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 bg-slate-900/50 rounded-lg">
            <span className="text-slate-400">Task 2: Firebase SDK</span>
            <span className={isFirebaseReady ? "text-emerald-400" : "text-amber-400"}>
              {isFirebaseReady ? "✓ Initialized" : "⚠ Initializing..."}
            </span>
          </div>
        </div>

        <div className="inline-block w-full px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          Phase 1, Task 2: Ready for Verification
        </div>
      </div>
    </div>
  );
}

export default App;