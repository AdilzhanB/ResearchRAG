import asyncio
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, init_db
from app.models.database import LegalDocument, DocumentTemplate, User
from app.services.vector_service import VectorService
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

# Sample legal documents
SAMPLE_DOCUMENTS = [
    {
        "id": "brown_v_board_1954",
        "title": "Brown v. Board of Education of Topeka",
        "content": """This landmark Supreme Court case declared state laws establishing separate public schools for black and white students to be unconstitutional. The decision effectively overturned the Plessy v. Ferguson decision of 1896, which had allowed state-sponsored segregation under the doctrine of 'separate but equal.' The Court ruled that separate educational facilities are inherently unequal, thereby violating the Equal Protection Clause of the Fourteenth Amendment to the U.S. Constitution.

The Court's opinion, delivered by Chief Justice Earl Warren, stated that education is perhaps the most important function of state and local governments. The Court found that segregated public education facilities were inherently unequal and therefore violated the Constitution. This decision marked the beginning of the end of legalized racial segregation in the United States and paved the way for the civil rights movement.""",
        "document_type": "case_law",
        "jurisdiction": "federal",
        "date_published": "1954-05-17",
        "citations": ["347 U.S. 483", "74 S. Ct. 686", "98 L. Ed. 873"],
        "metadata": {
            "court": "Supreme Court of the United States",
            "decision_type": "unanimous",
            "case_number": "No. 1",
            "legal_areas": ["constitutional_law", "civil_rights", "education"]
        }
    },
    {
        "id": "miranda_v_arizona_1966",
        "title": "Miranda v. Arizona",
        "content": """This Supreme Court case established the requirement that police inform suspects of their rights before interrogation. The Court held that statements made by suspects during custodial interrogation are inadmissible unless the suspect was informed of their right to remain silent, that anything they say can be used against them, and their right to an attorney. This decision arose from the case of Ernesto Miranda, who was arrested and confessed to serious crimes without being informed of his rights.

The Miranda decision established the famous Miranda warnings that must be given to suspects: 'You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be provided for you.' The Court ruled that the Fifth Amendment privilege against self-incrimination and the Sixth Amendment right to counsel require these warnings.""",
        "document_type": "case_law",
        "jurisdiction": "federal",
        "date_published": "1966-06-13",
        "citations": ["384 U.S. 436", "86 S. Ct. 1602", "16 L. Ed. 2d 694"],
        "metadata": {
            "court": "Supreme Court of the United States",
            "decision_type": "5-4",
            "case_number": "No. 759",
            "legal_areas": ["criminal_law", "constitutional_law", "fifth_amendment"]
        }
    },
    {
        "id": "marbury_v_madison_1803",
        "title": "Marbury v. Madison",
        "content": """This foundational Supreme Court case established the principle of judicial review, giving the federal courts the power to declare legislative and executive acts unconstitutional. The case arose when William Marbury petitioned the Supreme Court to force Secretary of State James Madison to deliver his commission as justice of the peace. Chief Justice John Marshall ruled that while Marbury had a right to his commission, the Court lacked jurisdiction to force its delivery.

More importantly, Marshall used this case to establish that the Supreme Court has the power to review acts of Congress and declare them unconstitutional if they conflict with the Constitution. This principle of judicial review became a cornerstone of American constitutional law and established the Supreme Court as a co-equal branch of government with the power to check legislative and executive power.""",
        "document_type": "case_law",
        "jurisdiction": "federal",
        "date_published": "1803-02-24",
        "citations": ["5 U.S. 137", "1 Cranch 137", "2 L. Ed. 60"],
        "metadata": {
            "court": "Supreme Court of the United States",
            "decision_type": "unanimous",
            "case_number": "No. 13",
            "legal_areas": ["constitutional_law", "judicial_review", "separation_of_powers"]
        }
    },
    {
        "id": "gideon_v_wainwright_1963",
        "title": "Gideon v. Wainwright",
        "content": """This Supreme Court case established the right to counsel for indigent defendants in felony cases. Clarence Gideon was charged with felony breaking and entering in Florida. He requested that the court appoint him counsel because he could not afford an attorney, but the judge denied his request. Gideon represented himself and was convicted. The Supreme Court unanimously overturned his conviction, ruling that the Sixth Amendment requires states to provide attorneys for defendants who cannot afford them.

The Court held that the assistance of counsel is fundamental to a fair trial and that the Constitution requires that indigent defendants be provided with counsel in felony cases. This decision was later extended to misdemeanor cases that carry a potential jail sentence.""",
        "document_type": "case_law",
        "jurisdiction": "federal",
        "date_published": "1963-03-18",
        "citations": ["372 U.S. 335", "83 S. Ct. 792", "9 L. Ed. 2d 799"],
        "metadata": {
            "court": "Supreme Court of the United States",
            "decision_type": "unanimous",
            "case_number": "No. 155",
            "legal_areas": ["criminal_law", "sixth_amendment", "right_to_counsel"]
        }
    },
    {
        "id": "mapp_v_ohio_1961",
        "title": "Mapp v. Ohio",
        "content": """This Supreme Court case established that evidence obtained in violation of the Fourth Amendment cannot be used in state criminal prosecutions. The case involved Dollree Mapp, whose home was searched by Cleveland police without a warrant. The police found obscene materials and arrested Mapp. The Supreme Court ruled that the exclusionary rule, which prohibits the use of illegally obtained evidence, applies to state courts through the Fourteenth Amendment.

Prior to this decision, the exclusionary rule only applied to federal courts. The Mapp decision extended Fourth Amendment protections to state criminal proceedings and significantly strengthened privacy rights by ensuring that illegally obtained evidence cannot be used to convict defendants in any American court.""",
        "document_type": "case_law",
        "jurisdiction": "federal",
        "date_published": "1961-06-19",
        "citations": ["367 U.S. 643", "81 S. Ct. 1684", "6 L. Ed. 2d 1081"],
        "metadata": {
            "court": "Supreme Court of the United States",
            "decision_type": "6-3",
            "case_number": "No. 236",
            "legal_areas": ["criminal_law", "fourth_amendment", "exclusionary_rule"]
        }
    }
]

# Sample document templates
SAMPLE_TEMPLATES = [
    {
        "id": "legal_brief_template",
        "name": "Legal Brief Template",
        "template_type": "brief",
        "description": "Standard template for legal briefs",
        "content_template": """
BRIEF TEMPLATE

IN THE {court}

{case_name}
Case No. {case_number}

BRIEF IN SUPPORT OF {motion_type}

TO THE HONORABLE COURT:

I. INTRODUCTION
{introduction}

II. STATEMENT OF FACTS
{facts}

III. ARGUMENT
{arguments}

IV. CONCLUSION
{conclusion}

Respectfully submitted,
{attorney_name}
{bar_number}
""",
        "fields": [
            {"name": "court", "type": "text", "required": True, "description": "Court name"},
            {"name": "case_name", "type": "text", "required": True, "description": "Case name"},
            {"name": "case_number", "type": "text", "required": True, "description": "Case number"},
            {"name": "motion_type", "type": "text", "required": True, "description": "Type of motion"},
            {"name": "introduction", "type": "textarea", "required": True, "description": "Brief introduction"},
            {"name": "facts", "type": "textarea", "required": True, "description": "Statement of facts"},
            {"name": "arguments", "type": "textarea", "required": True, "description": "Legal arguments"},
            {"name": "conclusion", "type": "textarea", "required": True, "description": "Conclusion"},
            {"name": "attorney_name", "type": "text", "required": True, "description": "Attorney name"},
            {"name": "bar_number", "type": "text", "required": True, "description": "Bar number"}
        ]
    },
    {
        "id": "contract_template",
        "name": "Service Agreement Template",
        "template_type": "contract",
        "description": "Template for service agreements",
        "content_template": """
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {date} between {party1} ("Client") and {party2} ("Service Provider").

1. SERVICES
The Service Provider agrees to provide the following services: {services}

2. COMPENSATION
The Client agrees to pay {compensation} for the services.

3. TERM
This Agreement shall commence on {start_date} and terminate on {end_date}.

4. TERMINATION
Either party may terminate this Agreement with {notice_period} written notice.

5. GOVERNING LAW
This Agreement shall be governed by the laws of {jurisdiction}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

{party1}: _____________________ Date: _____
{party2}: _____________________ Date: _____
""",
        "fields": [
            {"name": "date", "type": "date", "required": True, "description": "Agreement date"},
            {"name": "party1", "type": "text", "required": True, "description": "First party"},
            {"name": "party2", "type": "text", "required": True, "description": "Second party"},
            {"name": "services", "type": "textarea", "required": True, "description": "Description of services"},
            {"name": "compensation", "type": "text", "required": True, "description": "Compensation amount"},
            {"name": "start_date", "type": "date", "required": True, "description": "Start date"},
            {"name": "end_date", "type": "date", "required": True, "description": "End date"},
            {"name": "notice_period", "type": "text", "required": True, "description": "Notice period"},
            {"name": "jurisdiction", "type": "text", "required": True, "description": "Governing jurisdiction"}
        ]
    }
]

async def create_sample_user():
    """Create a sample user"""
    async with AsyncSessionLocal() as session:
        # Check if user already exists
        from sqlalchemy import select
        query = select(User).where(User.username == "demo_user")
        result = await session.execute(query)
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            user = User(
                username="demo_user",
                email="demo@legalresearch.com",
                hashed_password=get_password_hash("demo_password"),
                full_name="Demo User",
                is_active=True,
                is_superuser=False
            )
            session.add(user)
            await session.commit()
            logger.info("Created demo user")
        else:
            logger.info("Demo user already exists")

async def populate_documents():
    """Populate database with sample documents"""
    async with AsyncSessionLocal() as session:
        for doc_data in SAMPLE_DOCUMENTS:
            # Check if document already exists
            from sqlalchemy import select
            query = select(LegalDocument).where(LegalDocument.id == doc_data["id"])
            result = await session.execute(query)
            existing_doc = result.scalar_one_or_none()
            
            if not existing_doc:
                # Create document
                document = LegalDocument(
                    id=doc_data["id"],
                    title=doc_data["title"],
                    content=doc_data["content"],
                    document_type=doc_data["document_type"],
                    jurisdiction=doc_data["jurisdiction"],
                    date_published=doc_data["date_published"],
                    citations=doc_data["citations"],
                    metadata=doc_data["metadata"]
                )
                
                session.add(document)
                await session.commit()
                
                # Add to vector database
                try:
                    vector_id = await VectorService.add_document(
                        document_id=doc_data["id"],
                        content=doc_data["content"],
                        metadata={
                            "title": doc_data["title"],
                            "type": doc_data["document_type"],
                            "jurisdiction": doc_data["jurisdiction"],
                            "date": doc_data["date_published"],
                            "citations": doc_data["citations"]
                        }
                    )
                    
                    # Update document with vector ID
                    document.vector_id = str(vector_id)
                    await session.commit()
                    
                    logger.info(f"Created document: {doc_data['title']}")
                    
                except Exception as e:
                    logger.error(f"Error adding document to vector DB: {e}")
            else:
                logger.info(f"Document already exists: {doc_data['title']}")

async def populate_templates():
    """Populate database with sample templates"""
    async with AsyncSessionLocal() as session:
        for template_data in SAMPLE_TEMPLATES:
            # Check if template already exists
            from sqlalchemy import select
            query = select(DocumentTemplate).where(DocumentTemplate.id == template_data["id"])
            result = await session.execute(query)
            existing_template = result.scalar_one_or_none()
            
            if not existing_template:
                template = DocumentTemplate(
                    id=template_data["id"],
                    name=template_data["name"],
                    template_type=template_data["template_type"],
                    description=template_data["description"],
                    content_template=template_data["content_template"],
                    fields=template_data["fields"]
                )
                
                session.add(template)
                await session.commit()
                logger.info(f"Created template: {template_data['name']}")
            else:
                logger.info(f"Template already exists: {template_data['name']}")

async def initialize_application():
    """Initialize the application with sample data"""
    try:
        logger.info("Initializing application...")
        
        # Initialize database
        await init_db()
        
        # Initialize vector service
        await vector_service.initialize()
        
        # Create sample data
        await create_sample_user()
        await populate_templates()
        await populate_documents()
        
        logger.info("Application initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
        raise

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)
    asyncio.run(initialize_application())
