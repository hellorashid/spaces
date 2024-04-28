import { useEffect, useState } from "react";

import { MoonIcon, SunIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { Button, Card, IconButton, Popover, ScrollArea, SegmentedControl, Separator, Slider } from "@radix-ui/themes";
import { useAppContext } from "../utils/AppContext";

function DesignToolbar() {
    const [isDark, setIsDark] = useState("dark");
    const [backdrop, setBackdrop] = useState<number>(50);
    const { theme, setTheme } = useAppContext()

    // const toggleDark = (newTheme = "dark") => {
    //     console.log(theme)
    //     setTheme({ ...theme, appearance: newTheme })
    // };

    const Header = ({ title }: { title: string }) => {
        return (
            <p className="text-sm font-mono text-opacity-70 my-2"> {title}</p>
        );
    }

    useEffect(() => {
        console.log(theme)
        const newVal = Math.round(backdrop / 10) * 10
        //@ts-ignore
        setTheme({ ...theme, appearance: isDark, backdrop: newVal})
    }, [isDark, backdrop])

    // useEffect(() => {
    //     console.log(theme)
    //     setTheme({ ...theme, backdrop: backdrop})
    // }, [backdrop])

    const handleSliderChange = (value: number) => {
        console.log('Slider value:', value);
        // You can add your code here to handle the slider's value change
      };

    return (
        <Popover.Root>
            <Popover.Trigger>
                <SwatchIcon color="white" width={"20"} />
            </Popover.Trigger>
            <Popover.Content width="250px" className="bg-opacity-80 bg-gray-900 backdrop-blur-md">
                <div className="flex-1">
                    <SegmentedControl.Root value={theme.appearance} className=" w-full">
                        <SegmentedControl.Item value="light" onClick={()=>setIsDark("light")} >
                            <SunIcon color="white" width={"20"} />
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="dark" onClick={()=>setIsDark("dark")}>
                            <MoonIcon color="white" width={"20"} />
                        </SegmentedControl.Item>
                    </SegmentedControl.Root>
                </div>
                <div className="flex-1 my-6">
                    <Header title="opacity" />
                    {/* <p>{theme.appearance} {backdrop}</p> */}
                    <Slider value={[backdrop]} onValueChange={(e) =>setBackdrop(e[0])}  disabled/>
                </div>
                <div className="flex-1 my-6">
                    <Header title="bg" />
                    <div className="flex flex-wrap w-full gap-2">
                        <img src="./bg.webp" alt="random" className="w-16 h-16 rounded-md" />
                    </div>
                </div>

                {/* <Separator className="px-[-6] w-full" />
                <div className="flex-1 my-6">
                    <Header title="themes" />
                    <div className="">
                        <ScrollArea className="w-full h-32">
                            <Card className="w-full p-2 my-1"><p>pink vibes</p></Card>
                        </ScrollArea>
                    </div>
                </div> */}

            </Popover.Content>
        </Popover.Root>
    );
}

export default DesignToolbar;