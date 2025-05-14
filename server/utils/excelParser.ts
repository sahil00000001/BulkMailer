import * as xlsx from 'xlsx';
import { Recipient } from '@shared/schema';

export class ExcelParser {
  static parseExcelFile(buffer: Buffer): Recipient[] {
    try {
      // Read the Excel file
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      // Validate and transform data
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
      
      return recipients;
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      throw new Error('Failed to parse Excel file. Please check the format.');
    }
  }
  
  static generateSampleExcel(): Buffer {
    const worksheet = xlsx.utils.json_to_sheet([
      { Name: 'Sahil', Email: 'sahil@gmail.com', Designation: 'Software Developer', Company: 'Fortek' },
      { Name: 'Alex', Email: 'alex@gmail.com', Designation: 'Product Manager', Company: 'TechCorp' },
      { Name: 'Maria', Email: 'maria@gmail.com', Designation: 'Marketing Director', Company: 'BrandWave' }
    ]);
    
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Recipients');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
