/**
 * API functions for contact form submission and inquiry management
 */

/**
 * Submit a contact form inquiry
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Response from the submission
 */
export const submitInquiry = async (formData) => {
  try {
    // Create inquiry object with metadata
    const inquiry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'new',
      ...formData
    };
    
    // Store in localStorage
    const existingInquiries = getStoredInquiries();
    existingInquiries.push(inquiry);
    localStorage.setItem('zscore_inquiries', JSON.stringify(existingInquiries));
    
    console.log('Contact form submission stored:', inquiry);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return {
      success: true,
      message: 'Thank you for your inquiry! We will get back to you soon.',
      data: inquiry
    };
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return {
      success: false,
      message: 'There was an error submitting your inquiry. Please try again.',
      error: error.message
    };
  }
};

/**
 * Get all stored inquiries from localStorage
 * @returns {Array} Array of inquiry objects
 */
export const getStoredInquiries = () => {
  try {
    const stored = localStorage.getItem('zscore_inquiries');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading inquiries:', error);
    return [];
  }
};

/**
 * Update inquiry status
 * @param {string} inquiryId - The ID of the inquiry to update
 * @param {string} status - New status ('new', 'viewed', 'replied', 'archived')
 * @returns {boolean} Success status
 */
export const updateInquiryStatus = (inquiryId, status) => {
  try {
    const inquiries = getStoredInquiries();
    const inquiryIndex = inquiries.findIndex(inq => inq.id === inquiryId);
    
    if (inquiryIndex !== -1) {
      inquiries[inquiryIndex].status = status;
      inquiries[inquiryIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('zscore_inquiries', JSON.stringify(inquiries));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return false;
  }
};

/**
 * Delete an inquiry
 * @param {string} inquiryId - The ID of the inquiry to delete
 * @returns {boolean} Success status
 */
export const deleteInquiry = (inquiryId) => {
  try {
    const inquiries = getStoredInquiries();
    const filteredInquiries = inquiries.filter(inq => inq.id !== inquiryId);
    localStorage.setItem('zscore_inquiries', JSON.stringify(filteredInquiries));
    return true;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return false;
  }
};