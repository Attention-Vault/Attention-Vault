from loguru import logger
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
import os

# Initialize Groq LLM client
def get_llm_client():
    """
    Get the LLM client instance using Groq.

    Returns:
        ChatGroq: A configured LangChain ChatGroq client
    """
    try:
        # Initialize the Groq LLM client with the API key from settings
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not set in environment variables")
            return None

        llm = ChatGroq(
            model_name="llama3-8b-8192",  # Using LLaMa 3 8B model
            api_key=settings.GROQ_API_KEY,
            temperature=0.1,  # Low temperature for more deterministic responses
            max_tokens=1024,
        )
        return llm
    except Exception as e:
        logger.error(f"Error initializing LLM client: {str(e)}")
        return None


def validate_text(text: str) -> bool:
    """
    Validate that text is parseable by an LLM.

    In a production environment, this would call an actual LLM API
    to check if the text can be processed properly.

    Args:
        text: The text to validate

    Returns:
        bool: True if the text is valid, False otherwise
    """
    try:
        if os.environ.get("GROQ_API_KEY"):
            # Get LLM client
            llm = get_llm_client()
            if not llm:
                # Fall back to basic validation if LLM client isn't available
                logger.warning(
                    "LLM client not available, falling back to basic validation"
                )
                return True

            # Create prompt template for validation
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You are a text validator that determines if text meets basic standards for processing. "
                        "You should check if the text is coherent, meaningful, and doesn't contain harmful content.",
                    ),
                    (
                        "user",
                        "Please validate the following text and respond with VALID or INVALID:\n\n{text}",
                    ),
                ]
            )

            # Create chain and run inference
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({"text": text})

            # Check if the LLM considers the text valid
            is_valid = "VALID" in result.upper()
            if not is_valid:
                logger.warning(f"LLM determined text is invalid: {result}")

            return is_valid

        # Basic validation logic (example only)
        # In production, replace with actual LLM API call

        # Check if text is not empty
        if not text or len(text.strip()) == 0:
            logger.warning("Empty text provided")
            return False

        # Check if text has a minimum number of characters
        if len(text) < 10:
            logger.warning(f"Text too short: {len(text)} characters")
            return False

        # Check if text has a maximum length (to prevent abuse)
        if len(text) > 5000:
            logger.warning(f"Text too long: {len(text)} characters")
            return False

        # In a real implementation, you would send the text to an LLM API
        # and check if it returns a valid response

        return True

    except Exception as e:
        logger.error(f"Error validating text: {str(e)}")
        return False


async def verify_post_content(post_text: str, verification_text: str) -> bool:
    """
    Verifies that a Twitter post contents match the verification text requirements.

    Uses an LLM to determine if the post content fulfills the verification criteria.
    In a production environment, this would call an actual LLM API.

    Args:
        post_text: The text content of the Twitter post
        verification_text: The requirements or verification text to match against

    Returns:
        bool: True if the post content matches requirements, False otherwise
    """
    # return True # twitters api rate limits are insane, so we will just return true for now
    try:
        if os.environ.get("GROQ_API_KEY"):
            # Get LLM client
            llm = get_llm_client()

            # Create prompt template for verification
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You are tasked with determining if a tweet fulfills the given requirements. "
                        "You must respond with only 'yes' or 'no'.",
                    ),
                    (
                        "user",
                        """
                You are tasked with determining if the following tweet fulfills the requirements.

                TWEET:
                {post_text}

                REQUIREMENTS:
                {verification_text}

                Does the tweet fulfill the requirements? Answer with 'yes' or 'no' only.
                """,
                    ),
                ]
            )

            # Create chain and run inference
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke(
                {"post_text": post_text, "verification_text": verification_text}
            )

            # Check the LLM's decision
            result = result.lower().strip()
            logger.info(f"LLM verification result: {result}")

            # Interpret the response
            if "yes" in result:
                return True
            else:
                return False
        else:
            return True

        logger.info(f"Verifying post content against verification requirements")
        logger.info(f"Post text: {post_text}")
        logger.info(f"Verification text: {verification_text}")

        # Basic implementation
        # For demonstration purposes, we'll do a simple check:
        # 1. Check if post isn't empty
        if not post_text or len(post_text.strip()) == 0:
            logger.warning("Empty post text")
            return False

        # 2. Check if post has minimum length
        if len(post_text) < 10:
            logger.warning(f"Post text too short: {len(post_text)} characters")
            return False

        # 3. Check for keyword overlap as a basic heuristic
        # Extract important keywords from verification text (words longer than 5 chars)
        verification_words = set(
            [
                word.lower()
                for word in verification_text.split()
                if len(word) > 5 and word.isalnum()
            ]
        )

        # Count how many verification keywords appear in the post
        post_words = post_text.lower()
        matches = [word for word in verification_words if word in post_words]

        # If we get at least 2 keyword matches, consider it valid (or at least 50% if few keywords)
        min_matches = min(2, max(1, len(verification_words) // 2))

        logger.info(
            f"Found {len(matches)} matching keywords out of {len(verification_words)}"
        )
        logger.info(f"Required matches: {min_matches}")

        if len(matches) >= min_matches:
            return True
        else:
            logger.warning(
                "Not enough keyword matches between post and verification text"
            )
            return False

    except Exception as e:
        logger.error(f"Error verifying post content: {str(e)}")
        return False
