import { Popover, Button, Flex, Avatar, Box, TextArea, Text, Checkbox } from '@radix-ui/themes';
import { HeartIcon } from "@heroicons/react/24/outline";


function Feedback() {
    

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Button variant="soft" highContrast>
                    <HeartIcon width="16" height="16" />
                </Button>
            </Popover.Trigger>
            <Popover.Content width="360px" className='bg-slate-600 bg-opacity-10 backdrop-blur-sm'>
                <Flex gap="3" >
                    <Box flexGrow="1" >
                        <TextArea placeholder="be honest. its ok, i wont be offended... " style={{ height: 80 }} />
                        <Flex gap="3" mt="3" justify="end">
                            <Popover.Close>
                                <Button size="1">submit feedback</Button>
                            </Popover.Close>
                        </Flex>
                    </Box>
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

export default Feedback;