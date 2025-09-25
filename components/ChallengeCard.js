// components/ChallengeCard.js
// Component for displaying individual fan challenges

export default function ChallengeCard({ challenge }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const daysLeft = () => {
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
          <span 
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              challenge.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {challenge.status}
          </span>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-500">Start: </span>
            <span className="font-medium">{formatDate(challenge.start_date)}</span>
          </div>
          <div>
            <span className="text-gray-500">End: </span>
            <span className="font-medium">{formatDate(challenge.end_date)}</span>
          </div>
        </div>
        
        {daysLeft() > 0 && challenge.status === 'active' && (
          <div className="mt-3 bg-blue-50 rounded-md p-2 text-center text-sm">
            <span className="font-bold text-blue-700">{daysLeft()}</span>
            <span className="text-blue-700"> days left to participate</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <span className="ml-1 text-xs text-gray-500">{challenge.participants || 0} participants</span>
          </div>
          
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}