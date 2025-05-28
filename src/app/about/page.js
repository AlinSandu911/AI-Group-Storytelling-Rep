import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-indigo-800 mb-8">About AI Bedtime Story Teller</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
          <p className="mb-4">
            AI Bedtime Story Teller is a web application designed to help parents create engaging
            bedtime stories for their children using AI-generated content. Our system allows parents
            to write or generate stories, convert them to audio, and save both the text and audio files
            for future playback.
          </p>
          <p className="mb-4">
            Children have their own special access, where they can browse and listen to their saved
            stories through a simplified, child-friendly interface - making bedtime an even more magical
            experience.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">How AI Enhances Bedtime Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Creative Story Generation</h3>
              <p>
                Our AI can help generate creative, age-appropriate stories based on themes,
                characters, or prompts that you provide. Whether you need inspiration or a complete
                story, the AI can assist in crafting a perfect bedtime tale.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Personalized Content</h3>
              <p>
                Create stories that feature your child's name, interests, or favorite characters.
                Personalized stories can make bedtime reading more engaging and special for your little one.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Educational Themes</h3>
              <p>
                Incorporate educational elements or valuable life lessons into your stories.
                Our AI can help weave in concepts about kindness, courage, friendship, or even
                academic subjects like science or history.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Text-to-Speech Technology</h3>
              <p>
                Convert your stories into high-quality audio with our text-to-speech technology.
                This feature is perfect for busy parents or for creating a consistent bedtime
                routine even when you're not available to read in person.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Benefits for Parents and Children</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Save Time:</strong> Quickly generate stories when you're short on time or creativity.
            </li>
            <li>
              <strong>Build Consistency:</strong> Create a library of stories that can be used to maintain
              a consistent bedtime routine.
            </li>
            <li>
              <strong>Foster Imagination:</strong> Expose children to diverse stories that stimulate
              their imagination and creativity.
            </li>
            <li>
              <strong>Educational Value:</strong> Incorporate learning opportunities into bedtime stories.
            </li>
            <li>
              <strong>Strengthen Bonds:</strong> Create special moments with personalized stories that
              your children will remember.
            </li>
            <li>
              <strong>Accessibility:</strong> Access your stories from any device, ensuring bedtime stories
              continue even when you're traveling or away from home.
            </li>
          </ul>
        </div>
        
        <div className="bg-indigo-100 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Create Magical Bedtime Stories?</h2>
          <p className="mb-6">
            Join our community of parents who are enriching their children's bedtime routine with
            AI-generated stories. Sign up today and start creating memorable stories for your little ones.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition duration-300">
              Sign Up Now
            </Link>
            <Link href="/login" className="bg-white text-indigo-700 border border-indigo-700 px-6 py-2 rounded-md hover:bg-indigo-50 transition duration-300">
              Log In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;