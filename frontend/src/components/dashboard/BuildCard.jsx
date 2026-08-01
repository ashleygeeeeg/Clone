import React from 'react';
import { Rocket, DollarSign, CheckCircle, Share2, Check } from 'lucide-react';

const statusColors = {
  deployed: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700',
};

const PaymentBadge = ({ build }) => {
  if (build.is_free) {
    return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">FREE</span>;
  }
  if (build.payment_status === 'paid' || build.payment_status === 'mock_paid') {
    return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">PAID</span>;
  }
  return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">$10 - UNPAID</span>;
};

export const BuildCard = ({ build, copied, onPay, onDeploy, onShare }) => {
  const isPaid = build.is_free || build.payment_status === 'paid' || build.payment_status === 'mock_paid';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow" data-testid={`build-card-${build.id}`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 truncate flex-1">{build.name}</h4>
        <PaymentBadge build={build} />
      </div>
      {build.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{build.description}</p>}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[build.status] || statusColors.draft}`}>{build.status}</span>
      </div>
      <div className="flex items-center gap-2">
        {!build.is_free && build.payment_status === 'pending' && (
          <button onClick={() => onPay(build.id)} data-testid={`pay-build-btn-${build.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            <DollarSign className="w-3.5 h-3.5" /> Pay $10
          </button>
        )}
        {isPaid && build.status !== 'deployed' && (
          <button onClick={() => onDeploy(build.id)} data-testid={`deploy-build-btn-${build.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Rocket className="w-3.5 h-3.5" /> Deploy
          </button>
        )}
        {build.status === 'deployed' && (
          <>
            <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Live
            </span>
            <button
              onClick={() => onShare(build.id)}
              data-testid={`share-build-btn-${build.id}`}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? (<><Check className="w-3.5 h-3.5" /> Copied!</>) : (<><Share2 className="w-3.5 h-3.5" /> Share</>)}
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3">{new Date(build.created_at).toLocaleDateString()}</p>
    </div>
  );
};
