"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Check, Gavel, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import axios from "axios";
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";
import { useState } from "react";
import qs from 'query-string';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuTrigger,
    DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";


export const MembersModal = () => {

    const router = useRouter();

    const { onOpen, isOpen, onClose, type, data } = useModal();

    const [loadingId, setLoadingId] = useState('');

    const isModalOpen = isOpen && type === 'members';

    const { server } = data as { server: ServerWithMembersWithProfiles };

    const roleIconMap = {
        'GUEST': null,
        'MODERATOR': <ShieldCheck className="h-4 w-4 ml-1 text-indigo-500" />,
        'ADMIN': <ShieldAlert className="h-4 w-4 ml-1 text-rose-500" />
    };

    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {

            setLoadingId(memberId);

            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server?.id,
                    memberId,
                }
            });

            const response = await axios.patch(url, { role });

            router.refresh();
            onOpen('members', { server: response.data });

        } catch (e) {
            console.log(e)
        } finally {
            setLoadingId('');
        };
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        {server?.member?.length} Members
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.member?.map((mem) => (
                        <div key={mem.id} className="flex items-center gap-x-2 mb-6">
                            <UserAvatar src={mem.profile.imageUrl} />
                            <div className="flex flex-col gap-y-1">
                                <div className="text-xs font-semibold flex items-center gap-x-1">
                                    {mem.profile.name}
                                    {roleIconMap[mem.role]}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {mem.profile.email}
                                </p>
                            </div>
                            {server.profileId !== mem.profileId && loadingId !== mem.id && (
                                <div className="ml-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4 text-zinc-500" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="left">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="flex items-center">
                                                    <ShieldQuestion className="w-4 h-4 mr-2" />
                                                    <span>Role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => onRoleChange(mem.id, "GUEST")}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Guest
                                                            {mem.role === 'GUEST' && (
                                                                <Check className="h-4 w-4 ml-1" color="#b49cf7" />
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onRoleChange(mem.id, "MODERATOR")}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Moderator
                                                            {mem.role === 'MODERATOR' && (
                                                                <Check className="h-4 w-4 ml-1" color="#b49cf7" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Gavel className="h-4 w-4 mr-2" />
                                                Kick
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {loadingId === mem.id && (
                                <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}