import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Book, Phone, MapPin, AlertTriangle, User, Download, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Education = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const { currentUser } = useAuth();

  const educationalResources = [
    {
      id: 1,
      title: "Avalanche Safety Basics",
      description: "Avalanches are among the most dangerous hazards in snowy mountains. Learn how to identify avalanche terrain, understand snow conditions, and practice basic safety measures.",
      content: [
        "Always check avalanche forecasts before heading out",
        "Carry essential safety equipment: transceiver, probe, and shovel",
        "Travel with companions and maintain visual contact",
        "Avoid steep slopes (30-45 degrees) after heavy snowfall",
        "Learn to recognize warning signs: recent avalanches, cracking snow, hollow sounds"
      ],
      icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
      downloadLink: "#"
    },
    {
      id: 2,
      title: "Winter Survival Kit",
      description: "Being prepared with the right equipment can save lives in winter emergencies. Learn what to pack for snowy conditions.",
      content: [
        "Extra warm clothing and waterproof outer layers",
        "Emergency shelter (bivvy sack or tarp)",
        "Fire starting materials (waterproof matches, lighter)",
        "High-energy food and insulated water container",
        "First aid kit with hypothermia treatments",
        "Communication device and power bank",
        "Map, compass, and GPS device (with spare batteries)"
      ],
      icon: <User className="h-8 w-8 text-blue-500" />,
      downloadLink: "#"
    },
    {
      id: 3,
      title: "Reading Snow Conditions",
      description: "Understanding snow layers and conditions is crucial for assessing avalanche risk and making safe travel decisions.",
      content: [
        "Learn to identify different snow crystal types",
        "Understand how temperature affects snow stability",
        "Practice digging snow pits to analyze layers",
        "Recognize weak layers that can trigger avalanches",
        "Evaluate how wind affects snow loading on slopes"
      ],
      icon: <Book className="h-8 w-8 text-teal-500" />,
      downloadLink: "#"
    },
    {
      id: 4,
      title: "Winter Driving Safety",
      description: "Safe driving in snowy and icy conditions requires special skills and preparation.",
      content: [
        "Install winter tires when temperatures drop below 7°C/45°F",
        "Clear all snow and ice from your vehicle before driving",
        "Drive slowly and leave extra space between vehicles",
        "Avoid sudden movements: accelerate, brake, and steer gently",
        "Keep emergency supplies in your vehicle: blankets, food, shovel",
        "Plan your route and check road conditions before departing"
      ],
      icon: <MapPin className="h-8 w-8 text-red-500" />,
      downloadLink: "#"
    }
  ];

  const localAuthorities = [
    {
      name: "Mountain Rescue Team",
      phone: "555-123-4567",
      email: "rescue@snowmountain.gov",
      hours: "24/7 Emergency Services",
      description: "Professional rescue services for mountain emergencies. Call in case of avalanches, injuries, or lost persons."
    },
    {
      name: "Snow Safety Department",
      phone: "555-987-6543",
      email: "safety@snowmountain.gov",
      hours: "Mon-Fri: 8am-5pm",
      description: "Responsible for avalanche forecasting, trail safety, and public education about snow hazards."
    },
    {
      name: "Winter Road Maintenance",
      phone: "555-789-0123",
      email: "roads@snowmountain.gov",
      hours: "24/7 during winter months",
      description: "Managing snow removal, road salting, and highway closures during severe weather conditions."
    },
    {
      name: "Parks & Recreation Snow Services",
      phone: "555-456-7890",
      email: "parks@snowmountain.gov",
      hours: "Mon-Sun: 7am-7pm",
      description: "Information about trail conditions, closures, and recreation safety in snowy conditions."
    }
  ];

  const renderTabContent = () => {
    if (activeTab === 'resources') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationalResources.map(resource => (
            <Card key={resource.id} className="h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                {resource.icon}
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  {resource.content.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button as={Link} variant="outline" size="sm" to={resource.downloadLink}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    } else if (activeTab === 'authorities') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {localAuthorities.map((authority, idx) => (
            <Card key={idx} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{authority.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{authority.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary-600" />
                    <span className="font-medium">{authority.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email: </span>
                    <a href={`mailto:${authority.email}`} className="text-primary-600 hover:underline">
                      {authority.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500">Hours: </span>
                    <span>{authority.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Education & Resources</h1>
        <p className="text-gray-600 mb-6">
          Learn essential snow safety information and find local authorities who can help in emergencies.
        </p>
      </div>

      {!currentUser && (
        <Card className="bg-primary-50 border-primary-100 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <Shield className="h-10 w-10 text-primary-500 mr-4" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Get Full Access to Snow Shield</h3>
                  <p className="text-gray-600">Sign up for an account to access alerts, emergency services, and reporting features.</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button size="lg">Sign Up</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4 border-b pb-2 mb-6">
        <button
          className={`px-4 py-2 font-medium rounded-t-lg ${
            activeTab === 'resources' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('resources')}
        >
          Educational Resources
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg ${
            activeTab === 'authorities' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('authorities')}
        >
          Local Authorities
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Education; 