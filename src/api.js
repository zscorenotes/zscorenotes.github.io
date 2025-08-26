// src/api.js

import servicesData from '@/assets/entries/Services.json';
import portfolioData from '@/assets/entries/PortfolioItem.json';
import newsData from '@/assets/entries/NewsItem.json';

/**
 * A helper function to ensure the imported data is an array and
 * sort it alphabetically by the 'id' field.
 * @param {Array | Object} data - The data imported from a JSON file.
 * @returns {Array} The sorted array.
 */
const sortById = (data) => {
  const dataArray = Array.isArray(data) ? data : [data];
  // Sorts alphabetically by the 'id' field (e.g., 'abc' comes before 'abd')
  return dataArray.sort((a, b) => a.id.localeCompare(b.id));
};

export const getServices = async () => {
  const sortedData = sortById(servicesData);
  return Promise.resolve(sortedData);
};

export const getPortfolioItems = async () => {
  const sortedData = sortById(portfolioData);
  return Promise.resolve(sortedData);
};

export const getNewsItems = async () => {
  const sortedData = sortById(newsData);
  return Promise.resolve(sortedData);
};

export const submitInquiry = async (formData) => {
  // This remains a simulated async function
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Form submitted successfully:', formData);
  return { success: true };
};