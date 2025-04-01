import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageData, docType } = await request.json();
    
    // This is a mockup API since we don't have an actual Gemini API key
    // In a real app, you would pass the imageData to the Gemini API for analysis
    // imageData contains the base64 encoded image from the PDF page

    // Simulate a delay for the analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let analysis = '';
    
    switch (docType) {
      case 'rawText':
        analysis = "## Extracted Text\n\nThis appears to be a document containing various text elements. The main content includes paragraphs discussing technology implementation and business processes. There are several key points identified:\n\n- Introduction to data processing methods\n- Explanation of system architecture\n- Implementation guidelines\n\n## Key Findings\n\nThe document appears to be a technical specification or business report with multiple sections.";
        break;
      case 'arabicTranslate':
        analysis = "## الترجمة العربية\n\nيبدو أن هذا مستند يحتوي على عناصر نصية مختلفة. يتضمن المحتوى الرئيسي فقرات تناقش تنفيذ التكنولوجيا وعمليات الأعمال. تم تحديد عدة نقاط رئيسية:\n\n- مقدمة لطرق معالجة البيانات\n- شرح لبنية النظام\n- إرشادات التنفيذ\n\n## النتائج الرئيسية\n\nيبدو أن المستند عبارة عن مواصفات تقنية أو تقرير أعمال يحتوي على أقسام متعددة.";
        break;
      case 'summary':
        analysis = "## Document Summary\n\nThis document appears to be a technical report or business document with approximately 3-4 pages of content. \n\n### Main Topics\n1. Overview of business processes\n2. Technical implementation details\n3. Recommendations for future development\n\n### Key Findings\nThe document emphasizes the importance of standardized procedures and provides several examples of successful implementations.";
        break;
      case 'dataFields':
        analysis = "## Extracted Data Fields\n\n| Field | Value |\n|-------|-------|\n| Document Type | Technical Report |\n| Date | 2023-03-15 |\n| Author | John Smith |\n| Department | Technology |\n| Pages | 4 |\n\n## Additional Information\n\nThe document contains several tables and diagrams illustrating technical processes.";
        break;
      case 'invoice':
        analysis = "## Invoice Analysis\n\n**Invoice Number**: INV-2023-04567\n**Date**: March 15, 2023\n**Due Date**: April 15, 2023\n\n### Billing Information\n- **From**: ABC Technology Services\n- **To**: XYZ Corporation\n\n### Line Items\n1. Software Development Services - $5,000\n2. Cloud Infrastructure Setup - $2,500\n3. Maintenance (Monthly) - $1,200\n\n**Subtotal**: $8,700\n**Tax (10%)**: $870\n**Total Due**: $9,570";
        break;
      case 'contract':
        analysis = "## Contract Analysis\n\n**Contract Type**: Service Agreement\n**Effective Date**: January 10, 2023\n**Term**: 12 months\n\n### Key Provisions\n- **Services**: Technology consulting and implementation\n- **Payment Terms**: Net 30 days\n- **Termination**: 60-day notice required\n- **Confidentiality**: Strict NDA provisions included\n\n### Notable Clauses\n- Non-compete clause for 12 months post-termination\n- Intellectual property remains with the service provider\n- Force majeure clause includes pandemic provisions";
        break;
      case 'certificate':
        analysis = "## Certificate Details\n\n**Certificate Type**: Professional Certification\n**Issued To**: [Name appears to be redacted]\n**Issued By**: International Association of Technology Professionals\n**Date Issued**: June 12, 2022\n**Validity**: 3 years\n\n### Certification Areas\n- Advanced Data Analytics\n- System Architecture Design\n- Cloud Computing Solutions\n\n**Certificate Number**: IATP-2022-45678\n**Signature Authority**: Dr. James Wilson, IATP President";
        break;
      case 'official':
        analysis = "## Official Document Analysis\n\n**Document Type**: Government Notification\n**Issuing Authority**: Department of Information Technology\n**Reference Number**: GOV-IT-2023/456\n**Date of Issue**: February 28, 2023\n\n### Official Notices\n1. Updates to data protection regulations\n2. Compliance deadlines for new cybersecurity measures\n3. Registration requirements for technology service providers\n\n### Authentication Features\n- Official seal of the Department visible in top right corner\n- Digital signature verification code: DIT-VER-78952\n- Watermarked official letterhead";
        break;
      case 'research':
        analysis = "## Research Paper Analysis\n\n**Title**: Advancements in Cloud-Native Machine Learning Architectures\n**Authors**: Chen, J., Smith, R., & Kumar, P.\n**Publication**: Journal of Computational Intelligence (Vol. 45, Issue 3)\n\n### Abstract Summary\nThe paper explores novel approaches to deploying machine learning models in cloud-native environments, with emphasis on scalability and performance optimization.\n\n### Methodology\nMixed-methods approach combining quantitative performance analysis with qualitative case studies across 12 different implementation scenarios.\n\n### Key Findings\n1. Containerized ML deployments showed 35% performance improvement\n2. Microservice architecture reduced latency by 28% compared to monolithic deployments\n3. Resource utilization was optimized by 40% using the proposed framework\n\n### Citations\nThe paper contains approximately 42 citations to related works in cloud computing and machine learning domains.";
        break;
      default:
        analysis = "This appears to be a document with multiple pages. I can see text content, but would need more specific instructions to provide detailed analysis.";
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Failed to process the image' },
      { status: 500 }
    );
  }
} 