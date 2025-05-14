import * as XLSX from 'xlsx';
import { Recipient } from './types';

export const parseExcelFile = (file: File): Promise<Recipient[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map to recipient format and validate
        const recipients: Recipient[] = [];
        
        for (const row of jsonData) {
          const record = row as Record<string, any>;
          const name = record.Name || record.name;
          const email = record.Email || record.email;
          const designation = record.Designation || record.designation;
          const company = record.Company || record.company;
          
          // Basic validation
          if (!name || !email || !designation || !company) {
            console.error('Invalid row format:', record);
            continue;
          }
          
          // Validate email format
          if (!email.match(/^\S+@\S+\.\S+$/)) {
            console.error('Invalid email format:', email);
            continue;
          }
          
          recipients.push({
            name,
            email,
            designation,
            company,
            status: 'pending'
          });
        }
        
        resolve(recipients);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
