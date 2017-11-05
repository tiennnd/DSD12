// AgentCopy.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "windows.h"
#include "iostream"
#include "string"

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
	std::string sFolder, sSourceFile;
	std::string sCauHinh, sBuffer;
	char cDirectory[MAX_PATH] = {0}, cTemp[MAX_PATH] = {0};
	DWORD stt = 2;
	std::string sDirectory, sFileName, sCopyName, sTemp;
	BOOL bRet;
	DWORD dwByteRead, dwFileSize, dwRet;
	HANDLE hFile;
	char * cExt = NULL, *cBuffer = NULL, *cTemp2 = NULL, *cBuff = NULL;
	char cRabbitMQAddr[MAX_PATH] = {0}, cLogAddr[MAX_PATH] = {0};

	dwRet = GetCurrentDirectoryA(MAX_PATH, cDirectory);
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

	cTemp2 = strstr(cBuffer, "log:");
	strcpy(cLogAddr, cTemp2 + 5);
	cTemp2 = strstr(cLogAddr, " ");
	cTemp2[0] = 0;

	if (cBuffer)
	{
		free(cBuffer);
		cBuffer = NULL;
	}

	sFolder = sDirectory + "Agent";
	sSourceFile = sFolder + "\\Agent1.js";

	cBuffer = ReadFileNew(sSourceFile.c_str());
	if (cBuffer == NULL)
	{
		printf("\nDoc file Agent bi loi");
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
	std::string sLogAddr = "C:\\\\wamp64\\\\logs\\\\access.log";

	if (sBuffer.find(sLogAddr) == -1)
	{
		printf("\nK tim dc xau");
		system("pause");
		return 0;
	}

	sBuffer.replace(sBuffer.find(sLogAddr), sLogAddr.length(), cLogAddr);

	if (sBuffer.find(sRabbit) == -1)
	{
		printf("\nK tim dc xau");
		system("pause");
		return 0;
	}

	sBuffer.replace(sBuffer.find(sRabbit), sRabbit.length(), cRabbitMQAddr);
	
	while (stt < 502)
	{
		sprintf_s(cTemp, MAX_PATH, "\\Agent%d.js", stt);
		sTemp = cTemp;
		sCopyName = sFolder + sTemp;

		sprintf_s(cTemp, MAX_PATH, "Agent%d", stt);
		sTemp = cTemp;

		sprintf_s(cTemp, MAX_PATH, "Agent%d", stt - 1);

		std::string sAgent = cTemp;

		if (sBuffer.find(sAgent) == -1)
		{
			printf("\nK tim dc xau xx");
			system("pause");
			return 0;
		}

		sBuffer.replace(sBuffer.find(sAgent), sAgent.length(), sTemp);
		

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
		stt++;
	}

	//system("pause");
	ExitProcess(0);
	return 1;
}

