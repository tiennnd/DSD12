// CreateProcessReceive.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "windows.h"
#include "thread"
#include "string"

void CreateFileNew(char * szFileName)
{
	HANDLE hFile = INVALID_HANDLE_VALUE;

	while (1)
	{
		hFile = CreateFileA(szFileName, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
		if (hFile == INVALID_HANDLE_VALUE)
		{
			printf("%d\n", GetLastError());
			return;
		}
		CloseHandle(hFile);

		Sleep(500);
	}
}

char* ReadFileNew(std::string sFileName)
{
	HANDLE hFile;
	BOOL bRet;
	DWORD dwByteRead, dwFileSize, dwRet;
	char *cBuffer = NULL;

	hFile = CreateFileA(sFileName.c_str(), GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE)
	{
		printf("\nCreate File %s fail %d", sFileName.c_str(), GetLastError());
		return NULL;
	}

	dwFileSize = GetFileSize(hFile, NULL);
	cBuffer = (char*)malloc(dwFileSize + 100);
	ZeroMemory(cBuffer, dwFileSize + 100);

	bRet = ReadFile(hFile, cBuffer, dwFileSize, &dwByteRead, NULL);
	if (!bRet)
	{
		printf("\nReadFile fail %s %d", sFileName.c_str(), GetLastError());
		CloseHandle(hFile);
		return NULL;
	}

	CloseHandle(hFile);

	return cBuffer;
}


int _tmain(int argc, _TCHAR* argv[])
{
	STARTUPINFOA si;
	PROCESS_INFORMATION pi;
	WCHAR szCmdLine[MAX_PATH] = L"node E:\\PhanTan\\tong-hop\\Receiver\\receive.js";
	std::string sCmd = "node ";
	HANDLE hProcess = NULL, hFile;
	char cDirectory[MAX_PATH] = {0};
	char * cExt = NULL, *cBuffer = NULL, *cTemp2 = NULL;
	std::string sCauHinh;
	char cRabbitMQAddr[MAX_PATH] = {0}, cDBAddr[MAX_PATH] = {0}, cLogAddr[MAX_PATH] = {0};
	std::string sDirectory, sFileName, sCopyName, sTemp, sFolder, sSourceFile, sBuffer;
	BOOL bRet;
	DWORD dwByteRead;

	ZeroMemory( &si, sizeof(si) );
	si.cb = sizeof(si);
	ZeroMemory( &pi, sizeof(pi) );

	GetCurrentDirectoryA(MAX_PATH, cDirectory);
	cExt = strrchr(cDirectory, '\\');
	cExt[1] = 0;

	sDirectory = cDirectory;
	sCauHinh = sDirectory + "Cauhinh.txt";

	cBuffer = ReadFileNew(sCauHinh.c_str());
	if (cBuffer == NULL)
	{
		printf("\nDoc file cau honh bi loi ...");

		system("pause");
		return 0;
	}

	cTemp2 = strstr(cBuffer, "RabbitMQServer:");
	strcpy(cRabbitMQAddr, cTemp2 + strlen("RabbitMQServer:") + 1);
	cTemp2 = strstr(cRabbitMQAddr, " ");
	cTemp2[0] = 0;

	cTemp2 = strstr(cBuffer, "database:");
	strcpy(cDBAddr, cTemp2 + 10);
	cTemp2 = strstr(cDBAddr, " ");
	cTemp2[0] = 0;

	cTemp2 = strstr(cBuffer, "log:");
	strcpy(cLogAddr, cTemp2 + 5);
	cTemp2 = strstr(cLogAddr, " ");
	cTemp2[0] = 0;

	if (cBuffer)
	{
		free(cBuffer);
		cBuffer = NULL;
	}

	printf("\ncLog %s\n", cLogAddr);

	std::string sLogAddr = cLogAddr;
	std::string sT = "\\\\";
	while (sLogAddr.find(sT) != -1)
	{
		sLogAddr.replace(sLogAddr.find(sT), sT.length(), "\\");
	}

	printf("\ncLog2 %s\n", sLogAddr.c_str());

	std::thread CreateFileThread(CreateFileNew, cLogAddr);
	CreateFileThread.detach();


	sFolder = sDirectory + "Receiver";
	sSourceFile = sFolder + "\\receive.js";

	cBuffer = ReadFileNew(sSourceFile.c_str());
	if (cBuffer == NULL)
	{
		printf("\nDoc file Receive bi loi");
		system("pause");
		return 0;
	}

	sBuffer = cBuffer;
	if (cBuffer)
	{
		free(cBuffer);
		cBuffer = NULL;
	}

	std::string sRabbit = "amqp://tuannmg:123456@192.168.1.23";
	std::string sDBAddr = "mongodb://192.168.1.23:27017/pmpt";

	if (sBuffer.find(sDBAddr) == -1)
	{
		printf("\nK tim dc xau");
		system("pause");
		return 0;
	}

	sBuffer.replace(sBuffer.find(sDBAddr), sDBAddr.length(), cDBAddr);

	if (sBuffer.find(sRabbit) == -1)
	{
		printf("\nK tim dc xau");
		system("pause");
		return 0;
	}

	sBuffer.replace(sBuffer.find(sRabbit), sRabbit.length(), cRabbitMQAddr);

	sCopyName = sFolder + "\\receive1.js";

	hFile = CreateFileA(sCopyName.c_str(), GENERIC_READ | GENERIC_WRITE,FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE)
	{
		printf("\nCreate File fail %d", GetLastError());
		system("pause");
		return 0;
	}

	bRet = WriteFile(hFile, sBuffer.c_str(), strlen(sBuffer.c_str()), &dwByteRead, NULL);
	if (!bRet)
	{
		printf("\nReadFile fail %d", GetLastError());
		CloseHandle(hFile);
		system("pause");
		return 0;
	}

	CloseHandle(hFile);

	sCmd += sCopyName;

	while (1) 
	{
		if( !CreateProcessA(NULL,   // No module name (use command line)
			(LPSTR)(sCmd.c_str()),        // Command line
			NULL,           // Process handle not inheritable
			NULL,           // Thread handle not inheritable
			FALSE,          // Set handle inheritance to FALSE
			0,              // No creation flags
			NULL,           // Use parent's environment block
			NULL,           // Use parent's starting directory 
			&si,            // Pointer to STARTUPINFO structure
			&pi )           // Pointer to PROCESS_INFORMATION structure
			) 
		{
			printf( "CreateProcess failed (%d).\n", GetLastError() );
			continue;
		}
		CloseHandle( pi.hProcess );
		CloseHandle( pi.hThread );

		do 
		{
			hProcess = OpenProcess(PROCESS_VM_READ, FALSE, pi.dwProcessId);
			if (hProcess != NULL)
			{
				CloseHandle(hProcess);
				Sleep(1000);
				continue;
			}
			else
			{
				printf("\nOpenProcessFail %d\n", GetLastError());
				break;
			}
		} while (1);		
	} 

	return 0;
}

