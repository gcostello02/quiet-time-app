import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Information = () => {
  const form = useRef();
  const [statusMessage, setStatusMessage] = useState("")

  const sendEmail = (e) => {
    e.preventDefault();

    setStatusMessage("")

    emailjs
      .sendForm('service_jgut315', 'template_undjfhx', form.current, {
        publicKey: 'W4zjT8m9SGUJUIJjD',
      })
      .then(
        (response) => {
          console.log('Email sent successfully!', response.status, response.text)
          setStatusMessage("Your message has been sent successfully!")
        },
        (error) => {
          console.error('Failed to send email:', error)
          setStatusMessage("Oops! Something went wrong. Please try again.")
        }
      );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl text-center font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className='text-center text-gray-900 '>If you have any comments, questions, or suggestions on possible updates to TAWG, please fill out the form below or email us at <a href="mailto:timealonewgod@gmail.com">timealonewgod@gmail.com</a>.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {!statusMessage.includes('success') && (<form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900" htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="user_name"
                  name="name" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="user_email"
                  name="email" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900" htmlFor="purpose">Purpose</label>
                <input 
                  type="text" 
                  id="purpose"
                  name="purpose" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
                >
                  Send Message
                </button>
              </div>
            </form>)}

            {statusMessage && (
              <div className={`mt-4 p-3 rounded-md text-center ${statusMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {statusMessage}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Privacy Policy</h2>
              <div className="bg-white p-6 rounded-xl shadow">
                <p><strong>Effective Date:</strong> 05/25/2025</p>

                <h2 className="text-2xl font-semibold mt-4">Introduction</h2>
                <p>Welcome to TAWG ("we", "our", "us"). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.</p>

                <h2 className="text-2xl font-semibold mt-4">Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                <ul>
                  <li><strong>Personal Information:</strong> When you register an account, we may collect personal information such as your name, email address, and any other details you provide.</li>
                  <li><strong>Usage Data:</strong> We collect information about how you use our services, such as IP addresses, device information, and usage statistics.</li>
                  <li><strong>Content Data:</strong> Any notes, prayers, or other content you submit to the site is stored and may be used for the purposes of displaying it to you and others.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-4">How We Use Your Information</h2>
                <p>We may use the information we collect for the following purposes:</p>
                <ul>
                  <li>To provide and improve our services.</li>
                  <li>To personalize your experience.</li>
                  <li>To communicate with you, such as sending updates or important notices.</li>
                  <li>To comply with legal obligations.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-4">How We Protect Your Information</h2>
                <p>We take the security of your data seriously. We use industry-standard security measures, including encryption and secure servers, to protect your information from unauthorized access, alteration, or destruction.</p>

                <h2 className="text-2xl font-semibold mt-4">Sharing Your Information</h2>
                <p>We do not share your personal information with third parties unless:</p>
                <ul>
                  <li>You provide consent for us to do so.</li>
                  <li>We are required to do so by law or legal process.</li>
                  <li>We engage service providers who need access to your data to perform services on our behalf (e.g., hosting or analytics).</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-4">Your Rights</h2>
                <p>Depending on your location, you may have the right to:</p>
                <ul>
                  <li>Access, correct, or delete your personal data.</li>
                  <li>Object to or restrict certain processing of your data.</li>
                  <li>Withdraw your consent at any time.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-4">Cookies and Tracking Technologies</h2>
                <p>We use cookies to enhance your experience and collect usage data. You can manage cookie settings through your browser.</p>

                <h2 className="text-2xl font-semibold mt-4">Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the effective date will be updated.</p>

                <h2 className="text-2xl font-semibold mt-4">Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:timealonewgod@gmail.com">timealonewgod@gmail.com</a>.</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Terms of Service</h2>
              <div className="bg-white p-6 rounded-xl shadow">
                <p><strong>Effective Date:</strong> 05/25/2025</p>

                <h2 className="text-2xl font-semibold mt-4">Acceptance of Terms</h2>
                <p>By accessing and using TAWG ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.</p>

                <h2 className="text-2xl font-semibold mt-4">Account Registration</h2>
                <p>To use certain features of the Service, you may need to register an account. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>

                <h2 className="text-2xl font-semibold mt-4">User Conduct</h2>
                <p>You agree not to use the Service for any illegal or harmful activities, including but not limited to:</p>
                <ul>
                  <li>Violating any laws or regulations.</li>
                  <li>Infringing on intellectual property rights.</li>
                  <li>Uploading harmful or offensive content.</li>
                  <li>Attempting to disrupt or damage the Service.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-4">Content</h2>
                <p>You retain ownership of the content you submit to the Service (such as notes, prayers, etc.), but by submitting content, you grant TAWG a worldwide, non-exclusive, royalty-free license to use, display, and store your content as necessary for the operation of the Service.</p>

                <h2 className="text-2xl font-semibold mt-4">Privacy</h2>
                <p>Your use of the Service is subject to our Privacy Policy, which explains how we collect, use, and protect your personal data.</p>

                <h2 className="text-2xl font-semibold mt-4">Third-Party Services</h2>
                <p>The Service may contain links to third-party websites or services. We are not responsible for the content or practices of these third parties, and you use them at your own risk.</p>

                <h2 className="text-2xl font-semibold mt-4">Termination</h2>
                <p>We reserve the right to suspend or terminate your access to the Service at our discretion, without notice, if we believe you have violated these Terms.</p>

                <h2 className="text-2xl font-semibold mt-4">Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, TAWG will not be liable for any indirect, incidental, special, or consequential damages arising from your use or inability to use the Service.</p>

                <h2 className="text-2xl font-semibold mt-4">Changes to Terms</h2>
                <p>We may update these Terms from time to time. Any changes will be posted on this page, and the effective date will be updated.</p>

                <h2 className="text-2xl font-semibold mt-4">Governing Law</h2>
                <p>These Terms are governed by the laws of The United States. Any disputes will be resolved in the competent courts of The United States.</p>

                <h2 className="text-2xl font-semibold mt-4">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:timealonewgod@gmail.com">timealonewgod@gmail.com</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Information;
