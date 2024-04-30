import { useState } from 'react';
import { Popover, Button, Flex, Avatar, Box, TextArea, Text, Checkbox } from '@radix-ui/themes';
import { HeartIcon } from "@heroicons/react/24/outline";

function Feedback() {
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(''); // New state variable for error message

    const handleSubmit = async () => {
        if (feedback.trim() === '') {
            setError('Feedback cannot be empty'); // Set error message if feedback is empty
            return;
        }

        setIsLoading(true);

        const base_url = import.meta.env.PROD ? 'https://api.spaces.fun' : 'http://localhost:3003'
        await fetch( `${base_url}/feedback` , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback }),
        })
            .then(response => {
                if (response.ok) {
                    console.log('Feedback submitted successfully');
                    setFeedback('');
                    setIsLoading(false);
                    setIsSubmitted(true);
                    setError('');
                } else {
                    throw new Error('Failed to submit feedback');
                }
            })
            .catch(error => {
                console.error(error);
                setError('Failed to submit feedback');
                setIsLoading(false);
            });

    };

    const updateFeedback = (value: string) => {
        setError(''); 
        setIsSubmitted(false); 
        setFeedback(value);
    };

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Button variant="soft" className='bg-purple-950 text-purple-50 mr-2' >
                    Feedback <HeartIcon width="16" height="16" />
                </Button>
            </Popover.Trigger>
            <Popover.Content width="360px" className='bg-slate-900 bg-opacity-80 backdrop-blur-sm'>
                <Flex gap="3" >
                    <Box flexGrow="1" >
                        {isSubmitted && (
                            <Text color="green" className='text-sm'>thank you! join our discord to say hi 😊 </Text>
                        )}
                        {error && (
                            <Text color="red" className='text-sm'>{error}</Text> // Display error message if there is an error
                        )}
                        <TextArea
                            placeholder="what do you like? what didn't work? all feedback is welcome "
                            style={{ height: 80 }}
                            value={feedback}
                            onChange={(e) => updateFeedback(e.target.value)}
                         
                        />
                        <Flex gap="3" mt="3" justify="between" align="center">
                            <Flex align="start" gap="4">
                                <a href="https://discord.gg/PGv2az68" target="_blank" rel="noopener noreferrer">
                                    <img src="/discord-icon.webp" alt="discord" width="25" height="20" />
                                </a>
                                <a href="https://x.com/razberrychai" target="_blank" rel="noopener noreferrer">
                                    <img src="/x-icon.png" alt="discord" width="20" height="20" />
                                </a>
                            </Flex>

                            <Button size="1" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </Flex>
                    </Box>
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

export default Feedback;