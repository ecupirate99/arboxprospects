import { SearchCriteria, SearchResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function searchEntities(criteria: SearchCriteria): Promise<SearchResult[]> {
  try {
    let prompt = '';

    switch (criteria.industry) {
      case 'Municipalities with Utilities':
        prompt = `Find municipalities in ${criteria.state} that specifically offer utility services. Format the response as a JSON array with exactly 40 objects, each having these properties: id (number), entityName (string), websiteUrl (string). Only include valid URLs.`;
        break;
      case 'Utilities':
        prompt = `Find business entities in ${criteria.state} that are in the utilities industry OR contain any of these keywords: 'water authority', 'waste', 'water and sewer', 'electric', 'gas', 'energy', 'oil'. Format the response as a JSON array with exactly 40 objects, each having these properties: id (number), entityName (string), websiteUrl (string). Only include valid URLs.`;
        break;
      case 'Non-Profit':
        prompt = `Find business entities in ${criteria.state} that are non-profits OR contain any of these keywords: 'membership', 'association', 'club'. Format the response as a JSON array with exactly 40 objects, each having these properties: id (number), entityName (string), websiteUrl (string). Only include valid URLs.`;
        break;
      case 'Taxes':
        prompt = `Find only municipalities (cities, towns, counties) in ${criteria.state} that specifically handle and collect tax payments. Focus on entities that have tax collection departments or provide tax payment services. Format the response as a JSON array with exactly 40 objects, each having these properties: id (number), entityName (string), websiteUrl (string). Only include valid URLs that lead to their tax payment or tax information pages.`;
        break;
      default:
        prompt = `Find business entities in ${criteria.state} that are in the ${criteria.industry} industry. Format the response as a JSON array with exactly 40 objects, each having these properties: id (number), entityName (string), websiteUrl (string). Only include valid URLs.`;
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || 'Failed to fetch results');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from API');
    }

    const resultText = data.candidates[0].content.parts[0].text;
    
    try {
      // Find the first occurrence of '[' and last occurrence of ']'
      const startIndex = resultText.indexOf('[');
      const endIndex = resultText.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('No valid JSON array found in response');
      }
      
      const jsonStr = resultText.substring(startIndex, endIndex + 1);
      const results = JSON.parse(jsonStr);
      
      // Validate results format
      if (!Array.isArray(results) || !results.every(result => 
        typeof result === 'object' &&
        typeof result.id === 'number' &&
        typeof result.entityName === 'string' &&
        typeof result.websiteUrl === 'string'
      )) {
        throw new Error('Invalid results format');
      }
      
      return results;
    } catch (parseError) {
      console.error('Error parsing results:', parseError);
      throw new Error('Failed to parse search results. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
  }
}