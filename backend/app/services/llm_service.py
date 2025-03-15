from loguru import logger


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
    try:
        logger.info(f"Verifying post content against verification requirements")
        logger.info(f"Post text: {post_text}")
        logger.info(f"Verification text: {verification_text}")

        # Basic implementation (placeholder for actual LLM call)
        # In production, construct a prompt like:
        # prompt = f"""
        # You are tasked with determining if the following tweet fulfills the requirements.
        #
        # TWEET:
        # {post_text}
        #
        # REQUIREMENTS:
        # {verification_text}
        #
        # Does the tweet fulfill the requirements? Answer with 'yes' or 'no' only.
        # """

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
